import {
  isPseudoClass,
  isPseudoElement,
  isMediaQuery,
  generateCSSClasses,
  generateCSSMediaQueryFromNode,
  getModuleName,
  getVariantsFromAST,
  stringifyCSSRule,
} from '@elodin/utils'
import { isUnitlessProperty, hyphenateProperty } from 'css-in-js-utils'

import { baseReset, rootReset } from './getReset'

const defaultConfig = {
  devMode: false,
  rootNode: 'body',
  dynamicImport: false,
  generateResetClassName: type => '_elo_' + type,
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

  function generate(ast, fileName) {
    const css = generateCSS(ast, config)
    const js = generateJS(ast, config, adapter)
    const root = generateRoot(ast, config)

    return { [fileName + '.js']: root, ...css, ...js }
  }
  generate.filePattern = ['*.elo.js', '*.elo.css']
  generate.ignorePattern = ['node_modules']

  generate.baseReset = baseReset(generateResetClassName)
  generate.rootReset = rootReset(rootNode)

  return generate
}

function generateRoot(ast) {
  // TODO: include fragments
  const styles = ast.body.filter(node => node.type === 'Style')

  const imports = styles
    .map(
      module =>
        'import { ' + module.name + " } from './" + module.name + ".elo.js'"
    )
    .join('\n')

  return (
    imports +
    '\n\n' +
    'export {\n  ' +
    styles.map(module => module.name).join(',\n  ') +
    '\n}'
  )
}

function generateCSS(ast, { devMode }) {
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

    files[module.name + '.elo.css'] = classes
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

function generateJS(ast, { devMode, dynamicImport }, adapter) {
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

    const style = generateStyle(module.body)
    const classNameMap = generateClassNameMap(module.body, variantMap, devMode)
    const variantStyleMap = generateVariantStyleMap(module.body, variants)

    files[module.name + '.elo.js'] = adapter({
      style,
      variantStyleMap,
      moduleName: module.name,
      dynamicImport,
      classNameMap,
      resetClassName: '_elo_' + module.format,
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
    .map(declaration => ({
      property: declaration.property,
      value: declaration.value.value,
    }))

  const nests = nestings
    .map(nest => {
      if (nest.property.type === 'Variable' && nest.property.environment) {
        if (nest.boolean) {
          const pseudoClass = isPseudoClass(nest.property.value)
          const pseudoElement = isPseudoElement(nest.property.value)

          if (pseudoClass || pseudoElement) {
            return {
              property: (pseudoElement ? '::' : ':') + nest.property.value,
              value: generateStyle(nest.body),
            }
          }
        }

        if (isMediaQuery(nest.property.value)) {
          return {
            property:
              '@media ' +
              generateCSSMediaQueryFromNode(
                nest.value.value,
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
