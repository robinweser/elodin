import {
  isPseudoClass,
  isPseudoElement,
  isMediaQuery,
  generateCSSClasses,
  generateCSSMediaQueryFromNode,
  getModuleName,
  getVariantsFromAST,
  getVariablesFromAST,
  stringifyCSSRule,
} from '@elodin/utils'
import { isUnitlessProperty, hyphenateProperty } from 'css-in-js-utils'

import { baseReset, rootReset } from './getReset'
import { wrap } from 'module'

const defaultConfig = {
  devMode: false,
  generateResetClassName: type => '_elo_' + type,
  generateCSSFileName: moduleName => moduleName + '.elo',
  generateJSFileName: moduleName => moduleName + '.elo',
}

export default function createGenerator(customConfig = {}) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }

  const { adapter, generateResetClassName, rootNode } = config

  if (!adapter) {
    throw new Error(
      'An adapter needs to passed in order to generate code. See @elodin/generator-css-in-js/lib/adapters for more information.'
    )
  }

  let cssReset = baseReset(config.generateResetClassName)
  if (config.rootNode) {
    cssReset += rootReset(config.rootNode)
  }

  function generate(ast, path = '') {
    const fileName = path.split('/').pop()

    const relativeRootPath = '../'.repeat(path.split('/').length - 1)
    config.relativeRootPath = relativeRootPath || './'

    const css = generateCSS(ast, config)
    const js = generateJS(ast, config, adapter)
    const root = generateRoot(ast, config)

    return {
      [relativeRootPath +
      config.generateCSSFileName('_reset') +
      '.css']: cssReset,
      [fileName + '.js']: root,
      ...css,
      ...js,
    }
  }
  generate.filePattern = [
    config.generateJSFileName('*') + '.js',
    config.generateCSSFileName('*') + '.css',
  ]
  generate.ignorePattern = ['node_modules']

  return generate
}

function generateRoot(
  ast,
  { relativeRootPath, generateCSSFileName, generateJSFileName }
) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')

  const imports = styles
    .map(
      module =>
        'import { ' +
        module.name +
        " } from './" +
        generateJSFileName(module.name) +
        ".js'"
    )
    .join('\n')

  return (
    "import '" +
    relativeRootPath +
    generateCSSFileName('_reset') +
    ".css'\n" +
    imports +
    '\n\n' +
    'export {\n  ' +
    styles.map(module => module.name).join(',\n  ') +
    '\n}'
  )
}

function generateCSS(ast, { devMode, generateCSSFileName }) {
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

    const classes = generateCSSClasses(module.body, variantMap, devMode)

    files[generateCSSFileName(module.name) + '.css'] = classes
      .filter(selector => selector.declarations.length > 0)
      .map(selector => {
        const css = stringifyCSSRule(
          selector.declarations,
          getModuleName(module, devMode) + selector.modifier + selector.pseudo,
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

function generateJS(
  ast,
  { devMode, generateResetClassName, generateCSSFileName, generateJSFileName },
  adapter
) {
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

    const variables = getVariablesFromAST(module)
    const style = generateStyle(module.body)
    const classNameMap = generateClassNameMap(module.body, variantMap, devMode)
    const variantStyleMap = generateVariantStyleMap(module.body, variants)

    files[generateJSFileName(module.name) + '.js'] = adapter({
      style,
      variantStyleMap,
      variables,
      moduleName: module.name,
      cssFileName: generateCSSFileName(module.name),
      classNameMap,
      resetClassName: generateResetClassName(module.format),
      className: getModuleName(module, devMode),
      variants: variantMap,
    })

    return files
  }, {})
}

function generateClassNameMap(
  nodes,
  variantMap,
  devMode,
  classes = {},
  variations = {},
  modifier = []
) {
  const nesting = nodes.filter(node => node.type !== 'Declaration')
  const variantOrder = Object.keys(variantMap)
  // ensure the variant modifier order is always deterministic
  classes[
    modifier
      .sort((a, b) =>
        variantOrder.indexOf(a[0]) > variantOrder.indexOf(b[0]) ? 1 : -1
      )
      .map(([name, value]) =>
        devMode
          ? '__' + name + '-' + value
          : '_' +
            variantOrder.indexOf(name) +
            '-' +
            variantMap[name].indexOf(value)
      )
      .join('')
  ] = variations

  nesting.forEach(nest => {
    if (nest.property.type === 'Identifier') {
      const variant = variantMap[nest.property.value]

      if (variant) {
        if (nest.value.type === 'Identifier') {
          const variation = variant.indexOf(nest.value.value) !== -1

          if (variation) {
            generateClassNameMap(
              nest.body,
              variantMap,
              devMode,
              classes,
              {
                ...variations,
                [nest.property.value]: nest.value.value,
              },
              [...modifier, [nest.property.value, nest.value.value]]
            )
          }
        }
      } else {
        // TODO: throw
      }
    }
  })

  return classes
}

function generateVariantStyleMap(
  nodes,
  variants,
  styles = {},
  style = [],
  modifier = []
) {
  const nesting = nodes.filter(node => node.type !== 'Declaration')
  const variantOrder = variants.map(variant => variant.name)

  if (style.length > 0) {
    styles[
      modifier
        .sort((a, b) =>
          variantOrder.indexOf(a[0]) > variantOrder.indexOf(b[0]) ? 1 : -1
        )
        .map(([name, value]) => '__' + name + '-' + value)
        .join('')
    ] = style
  }

  nesting.forEach(nest => {
    if (nest.property.type === 'Identifier') {
      const variant = variants.find(
        variant => variant.name === nest.property.value
      )

      if (variant) {
        if (nest.value.type === 'Identifier') {
          const variation = variant.body.find(
            variant => variant.value === nest.value.value
          )

          if (variation) {
            generateVariantStyleMap(
              nest.body,
              variants,
              styles,
              generateStyle(nest.body),
              [...modifier, [variant.name, variation.value]]
            )
          }
        }
      } else {
        // TODO: throw
      }
    }
  })

  return styles
}

function generateStyle(nodes) {
  const base = nodes.filter(node => node.type === 'Declaration')
  const nestings = nodes.filter(node => node.type !== 'Declaration')

  const declarations = base
    .filter(decl => decl.dynamic)
    .map(decl => ({
      property: decl.property,
      value: generateValue(decl.value),
    }))

  const nests = nestings
    .map(nest => {
      if (nest.property.type === 'Variable' && nest.property.environment) {
        const pseudoClass = isPseudoClass(nest.property.value)
        const pseudoElement = isPseudoElement(nest.property.value)
        const mediaQuery = isMediaQuery(nest.property.value)

        if ((pseudoClass || pseudoElement) && nest.boolean) {
          return {
            property: (pseudoElement ? '::' : ':') + nest.property.value,
            value: generateStyle(nest.body),
          }
        }

        if (mediaQuery) {
          return {
            property:
              '@media ' +
              generateCSSMediaQueryFromNode(
                nest.boolean ? undefined : nest.value.value,
                nest.property.value,
                nest.operator
              ),
            value: generateStyle(nest.body),
          }
        }
      }
    })
    .filter(nesting => nesting && nesting.value.length > 0)

  return [...declarations, ...nests]
}

function wrapInString(value) {
  return "'" + value + "'"
}

const inlineFns = {
  add: true,
  sub: true,
  mul: true,
  div: true,
  percentage: true,
}

const stringFns = {
  rgb: true,
  rgba: true,
  hsl: true,
  hsla: true,
}

function generateFunction(node) {
  if (stringFns[node.callee]) {
    return wrapInString(
      node.callee +
        '(' +
        node.params
          .map(param => {
            if (
              param.type === 'Variable' ||
              (param.type === 'FunctionExpression' && inlineFns[param.callee])
            ) {
              return "' + (" + generateValue(param) + ") + '"
            }
            return generateValue(param)
          })
          .join(', ') +
        ')'
    )
  }

  if (node.callee === 'percentage') {
    return '(' + generateValue(node.params[0]) + ") + '%'"
  }

  if (node.callee === 'raw') {
    return generateValue(node.params[0])
  }

  if (node.callee === 'add') {
    return node.params.map(generateValue).join(' + ')
  }

  if (node.callee === 'sub') {
    return node.params.map(generateValue).join(' - ')
  }

  if (node.callee === 'mul') {
    return node.params.map(generateValue).join(' * ')
  }

  // if (math[node.callee]) {
  //   return generateValue({
  //     type: 'Integer',
  //     value: resolveMath(value),
  //   })
  // }
}

function generateValue(node) {
  if (node.type === 'FunctionExpression') {
    return generateFunction(node)
  }

  if (node.type === 'Integer') {
    return (node.negative ? '-' : '') + node.value
  }

  if (node.type === 'Float') {
    return (node.negative ? '-' : '') + node.integer + '.' + node.fractional
  }

  if (node.type === 'Identifier') {
    return hyphenateProperty(node.value)
  }

  if (node.type === 'Variable') {
    return 'props.' + node.value
  }

  return node.value
}
