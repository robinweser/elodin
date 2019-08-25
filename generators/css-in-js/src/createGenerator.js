import {
  isPseudoClass,
  isPseudoElement,
  isMediaQuery,
  generateCSSMediaQueryFromNode,
  generateCSSClasses,
  getModuleName,
  stringifyCSSRule,
} from '@elodin/utils'
import { isUnitlessProperty, hyphenateProperty } from 'css-in-js-utils'
import color from 'color'

import adapters from './adapters'

export default function createGenerator({
  adapter = 'fela',
  devMode = false,
  rootNode = 'body',
  dynamicImport = false,
} = {}) {
  const usedAdapter = adapters.find(adapt => adapt.name === adapter)
  const config = {
    devMode,
    rootNode,
    dynamicImport,
  }

  return function generate(ast, fileName) {
    const css = generateCSS(ast, config)
    const js = generateJS(ast, config, usedAdapter)
    const root = generateRoot(ast, config)

    return { [fileName + '.js']: root, ...css, ...js }
  }
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
    const classes = generateCSSClasses(module.body, variants)

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
    const style = generateStyle(module.body)
    const classNameMap = generateClassNameMap(module.body, variants)

    files[module.name + '.elo.js'] = adapter.stringify({
      style,
      moduleName: module.name,
      dynamicImport,
      classNameMap,
      className: '_elo_' + module.format + ' ' + getModuleName(module, devMode),
      variants: variants.reduce((flatVariants, variant) => {
        flatVariants[variant.name] = variant.body.map(
          variation => variation.value
        )

        return flatVariants
      }, {}),
    })

    return files
  }, {})
}

function generateClassNameMap(
  nodes,
  variants,
  classes = {},
  variations = {},
  modifier = ''
) {
  const base = nodes.filter(node => node.type === 'Declaration')
  const nesting = nodes.filter(node => node.type !== 'Declaration')

  classes[modifier] = variations

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
            generateClassNameMap(
              nest.body,
              variants,
              classes,
              {
                ...variations,
                [variant.name]: variation.value,
              },
              modifier + '__' + variant.name + '-' + variation.value
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
            property: getCSSMediaQueryFromNode(
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
