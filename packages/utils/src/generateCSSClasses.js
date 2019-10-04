import { hyphenateProperty } from 'css-in-js-utils'

import generateCSSMediaQueryFromNode from './generateCSSMediaQueryFromNode'
import generateCSSValue from './generateCSSValue'
import isPseudoClass from './isPseudoClass'
import isPseudoElement from './isPseudoElement'
import isMediaQuery from './isMediaQuery'

function getStaticDeclarations(declarations) {
  return declarations
    .filter(decl => !decl.dynamic)
    .map(declaration => ({
      property: declaration.property,
      value: generateCSSValue(declaration.value, declaration.property),
    }))
}

export default function generateCSSClasses(
  nodes,
  variantMap,
  devMode,
  classes = [],
  modifier = [],
  pseudo = '',
  media = ''
) {
  const base = nodes.filter(node => node.type === 'Declaration')
  const nesting = nodes.filter(node => node.type !== 'Declaration')
  const variantOrder = Object.keys(variantMap)

  classes.push({
    media,
    pseudo,
    // ensure the variant modifier order is always deterministic
    modifier: modifier
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
      .join(''),
    declarations: getStaticDeclarations(base),
  })

  nesting.forEach(nest => {
    if (nest.property.type === 'Identifier') {
      const variant = variantMap[nest.property.value]

      if (variant) {
        if (nest.value.type === 'Identifier') {
          const variation = variant.indexOf(nest.value.value) !== -1

          if (variation) {
            generateCSSClasses(
              nest.body,
              variantMap,
              devMode,
              classes,
              [...modifier, [nest.property.value, nest.value.value]],
              pseudo,
              media
            )
          }
        }
      } else {
        // TODO: throw
      }
    }

    if (nest.property.type === 'Variable' && nest.property.environment) {
      const pseudoClass = isPseudoClass(nest.property.value)
      const pseudoElement = isPseudoElement(nest.property.value)
      const mediaQuery = isMediaQuery(nest.property.value)

      if ((pseudoClass || pseudoElement) && nest.boolean) {
        generateCSSClasses(
          nest.body,
          variantMap,
          devMode,
          classes,
          modifier,
          pseudo +
            (pseudoElement ? '::' : ':') +
            hyphenateProperty(nest.property.value),
          media
        )
      }

      if (mediaQuery) {
        generateCSSClasses(
          nest.body,
          variantMap,
          devMode,
          classes,
          modifier,
          pseudo,
          media +
            (media ? ' and ' : '') +
            generateCSSMediaQueryFromNode(
              nest.boolean ? undefined : nest.value.value,
              nest.property.value,
              nest.operator
            )
        )
      }
    }
  })

  return classes
}
