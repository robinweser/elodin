import {
  generateClasses,
  generateClassName,
  generateClassNameMap,
  generateMediaQueryFromNode,
  isMediaQuery,
  isPseudoClass,
  isPseudoElement,
  stringifyRule,
} from '@elodin/utils-css'
import { getVariablesFromAST, getVariantsFromAST } from '@elodin/utils-core'
import { generateValue } from '@elodin/utils-javascript'
import { hyphenateProperty } from 'css-in-js-utils'
import capitalizeString from 'capitalize'
import uncapitalizeString from 'uncapitalize'

const defaultConfig = {
  devMode: false,
  dynamicImport: false,
  extractCSS: true,
  generateStyleName: styleName => styleName,
  generateCSSFileName: moduleName => moduleName + '.elo',
  generateJSFileName: moduleName => moduleName + '.elo',
}

export default function createGenerator(customConfig = {}) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }

  function generate(ast, path = '') {
    const fileName = path.split('/').pop()

    const root = generateRootFile(ast, config)
    const js = generateJSFiles(ast, config, fileName)
    const css = config.extractCSS ? generateCSSFiles(ast, config, fileName) : {}

    return {
      [fileName + '.js']: root,
      ...css,
      ...js,
    }
  }

  generate.filePattern = [
    config.generateJSFileName('*') + '.js',
    config.generateCSSFileName('*') + '.css',
  ]

  return generate
}

function generateRootFile(
  ast,
  { generateCSSFileName, generateJSFileName, generateStyleName }
) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')

  const imports = styles
    .map(
      module =>
        'import { ' +
        generateStyleName(module.name) +
        " } from './" +
        generateJSFileName(module.name) +
        ".js'"
    )
    .join('\n')

  return (
    imports +
    '\n\n' +
    'export {\n  ' +
    styles.map(module => generateStyleName(module.name)).join(',\n  ') +
    '\n}'
  )
}

function generateJSFiles(ast, config, fileName) {
  const {
    devMode,
    generateJSFileName,
    generateCSSFileName,
    generateStyleName,
    textBaseClassName,
    viewBaseClassName,
    dynamicImport,
    extractCSS,
  } = config

  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  return styles.reduce((files, module) => {
    const out = generateStyle(module.body, extractCSS, {})
    const usedVariants = getVariantsFromAST(module)
    const variantMap = variants.reduce((flatVariants, variant) => {
      if (usedVariants[variant.name]) {
        flatVariants[variant.name] = variant.body.map(
          variation => variation.value
        )
      }

      return flatVariants
    }, {})

    const variables = getVariablesFromAST(module)
    const classNameMap = extractCSS
      ? generateClassNameMap(module.body, variantMap, devMode)
      : {}
    const baseClassName =
      (module.format === 'view' && viewBaseClassName) ||
      (module.format === 'text' && textBaseClassName)

    const hasVariations = Object.keys(classNameMap).length > 1
    const className = generateClassName(module, devMode)

    const fullClassName = [
      baseClassName ? baseClassName : '',
      extractCSS && !hasVariations ? className : '',
    ]
      .filter(Boolean)
      .join(' ')

    const style =
      '  return {\n' +
      (fullClassName || (extractCSS && hasVariations)
        ? '    _className: '
        : '') +
      (fullClassName
        ? wrapInString(fullClassName + (extractCSS && hasVariations ? ' ' : ''))
        : '') +
      (extractCSS && hasVariations
        ? (fullClassName ? ' + ' : '') +
          "getClassNameFromVariantMap('" +
          className +
          "', variantClassNameMap, props),\n"
        : fullClassName
        ? ',\n'
        : '') +
      stringifyStyle(out) +
      '  }'

    const rule =
      'export function ' +
      generateStyleName(module.name) +
      '(props = {}) {\n' +
      (dynamicImport && extractCSS
        ? '  import("./' + generateCSSFileName(module.name) + '.css")\n\n'
        : '') +
      style +
      '\n};'

    files[generateJSFileName(module.name) + '.js'] =
      (hasVariations
        ? 'import { getClassNameFromVariantMap } from "@elodin/runtime"\n'
        : '') +
      (extractCSS && !dynamicImport
        ? 'require("./' + generateCSSFileName(module.name) + '.css")\n\n'
        : '') +
      (hasVariations
        ? 'const variantClassNameMap = ' +
          JSON.stringify(classNameMap, null, 2) +
          '\n\n'
        : '') +
      rule

    return files
  }, {})
}

function generateCSSFiles(ast, { devMode, generateCSSFileName }) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')
  const variants = ast.body.filter(node => node.type === 'Variant')

  return styles.reduce((files, module) => {
    const usedVariants = getVariantsFromAST(module)
    const variantMap = variants.reduce((flatVariants, variant) => {
      if (usedVariants[variant.name]) {
        flatVariants[variant.name] = variant.body.map(
          variation => variation.value
        )
      }

      return flatVariants
    }, {})

    const classes = generateClasses(module.body, variantMap, devMode)

    files[generateCSSFileName(module.name) + '.css'] = classes
      .filter(selector => selector.declarations.length > 0)
      .map(selector => {
        const css = stringifyRule(
          selector.declarations,
          generateClassName(module, devMode) +
            selector.modifier +
            selector.pseudo,
          selector.media ? '  ' : ''
        )

        if (selector.media) {
          return '@media ' + selector.media + ' {\n' + css + '\n}'
        }

        return css
      })
      .join('\n\n')

    return files
  }, {})
}

function stringifyStyle(style, out = '', level = 2) {
  Object.keys(style).map(property => {
    const value = style[property]

    if (typeof value === 'object') {
      // handle extend
      if (Array.isArray(value)) {
        out +=
          '  '.repeat(level) +
          wrapInString(property) +
          ': ' +
          '[' +
          value
            .map(
              extension =>
                '{\n' +
                stringifyStyle(extension, '', level + 1) +
                '  '.repeat(level) +
                '}'
            )
            .join(',') +
          '],' +
          '\n'
      } else {
        if (property === 'style') {
          out +=
            '  '.repeat(level) +
            wrapInString(property) +
            ': ' +
            '{\n' +
            stringifyStyle(value, '', level + 1) +
            '  '.repeat(level) +
            '},\n'
        } else {
          out +=
            '  '.repeat(level) +
            wrapInString(property) +
            ': ' +
            '{\n' +
            stringifyStyle(value, '', level + 1) +
            '  '.repeat(level) +
            '},\n'
        }
      }
    } else {
      out += '  '.repeat(level) + wrapInString(property) + ': ' + value + ',\n'
    }
  })

  return out
}

function generateStyle(nodes, extractCSS, style = {}) {
  nodes.map(node => {
    if (node.type === 'Declaration' && (node.dynamic || !extractCSS)) {
      const prefix = node.value.type === 'Variable' ? 'props.' : ''

      style[node.property] =
        prefix + generateValue(node.value, node.property, node.dynamic)
    }

    if (node.type === 'Conditional') {
      if (node.property.type === 'Variable' && node.property.environment) {
        if (
          node.boolean &&
          (isPseudoClass(node.property.value) ||
            isPseudoElement(node.property.value))
        ) {
          const nested = generateStyle(node.body, extractCSS)

          if (Object.keys(nested).length > 0) {
            style[
              (isPseudoElement(node.property.value) ? '::' : ':') +
                hyphenateProperty(node.property.value)
            ] = nested
          }
        }

        if (isMediaQuery(node.property.value)) {
          const nested = generateStyle(node.body, extractCSS)

          if (Object.keys(nested).length > 0) {
            style[
              '@media ' +
                generateMediaQueryFromNode(
                  node.boolean ? undefined : node.value.value,
                  node.property.value,
                  node.operator
                )
            ] = nested
          }
        }
      } else {
        if (
          node.property.type === 'Identifier' &&
          node.value.type === 'Identifier' &&
          node.operator === '='
        ) {
          if (!style.extend) {
            style.extend = []
          }

          const nested = generateStyle(node.body, extractCSS)

          if (Object.keys(nested).length > 0) {
            style.extend.push({
              condition:
                'props.' +
                uncapitalizeString(node.property.value) +
                ' === ' +
                wrapInString(node.value.value) +
                '',
              style: nested,
            })
          }

          if (style.extend.length === 0) {
            delete style.extend
          }
        }
      }
    }
  })

  return style
}

function wrapInString(value) {
  return '"' + value + '"'
}

function wrapInParens(value) {
  return '(' + value + ')'
}
