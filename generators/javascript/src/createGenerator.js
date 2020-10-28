import {
  generateClasses,
  generateClassName,
  generateMediaQueryFromNode,
  isMediaQuery,
  isPseudoClass,
  isPseudoElement,
  stringifyRule,
} from '@elodin/utils-css'
import { generateModifierMap } from '@elodin/utils-javascript'
import { getVariantsFromAST } from '@elodin/utils-core'
import uncapitalizeString from 'uncapitalize'

const defaultConfig = {
  devMode: false,
  dynamicImport: false,
  generateStyleName: styleName => styleName,
  generateCSSFileName: moduleName => moduleName + '.elo',
  generateJSFileName: moduleName => moduleName + '.elo',
  generateVariantName: uncapitalizeString,
  generateVariantValue: uncapitalizeString,
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
    const css = generateCSSFiles(ast, config, fileName)

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
    generateVariantName,
    generateVariantValue,
    baseClassName,
    dynamicImport,
  } = config

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

    const modifierMap = generateModifierMap(module.body, variantMap, {
      devMode,
      generateVariantName,
      generateVariantValue,
      valueSeparator: '-',
    })

    const hasVariations = Object.keys(modifierMap).length > 1
    const className = generateClassName(module, devMode)

    const fullClassName = [
      baseClassName ? baseClassName : '',
      !hasVariations ? className : '',
    ]
      .filter(Boolean)
      .join(' ')

    const style =
      '  return ' +
      (fullClassName
        ? wrapInString(fullClassName + (hasVariations ? ' ' : ''))
        : '') +
      (hasVariations
        ? (fullClassName ? ' + ' : '') +
          "getClassNameFromModifierMap('" +
          className +
          "', modifierMap, props)"
        : fullClassName
        ? ''
        : '')

    const rule =
      'export function ' +
      generateStyleName(module.name) +
      '(props = {}) {\n' +
      (dynamicImport
        ? '  import("./' + generateCSSFileName(module.name) + '.css")\n\n'
        : '') +
      style +
      '\n};'

    files[generateJSFileName(module.name) + '.js'] =
      (hasVariations
        ? 'import { getClassNameFromModifierMap } from "@elodin/runtime"\n'
        : '') +
      (!dynamicImport
        ? 'require("./' + generateCSSFileName(module.name) + '.css")\n\n'
        : '') +
      (hasVariations
        ? 'const modifierMap = ' + JSON.stringify(modifierMap, null, 2) + '\n\n'
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

function wrapInString(value) {
  return '"' + value + '"'
}
