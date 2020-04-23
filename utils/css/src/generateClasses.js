import { hyphenateProperty } from 'css-in-js-utils'

import generateMediaQueryFromNode from './generateMediaQueryFromNode'
import generateValue from './generateValue'

import isPseudoClass from './isPseudoClass'
import isPseudoElement from './isPseudoElement'
import isMediaQuery from './isMediaQuery'

export default function generateClasses(
  nodes,
  variantMap,
  devMode,
  classes = [],
  modifier = [],
  pseudo = '',
  media = ''
) {
  const base = nodes.filter((node) => node.type === 'Declaration')
  const nesting = nodes.filter((node) => node.type !== 'Declaration')
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
    declarations: base.map((declaration) => ({
      property: declaration.property,
      value: generateValue(declaration.value, declaration.property),
    })),
  })

  nesting.forEach((nest) => {
    if (nest.property.type === 'Identifier') {
      const variant = variantMap[nest.property.value]

      if (variant) {
        if (nest.value.type === 'Identifier') {
          const variation = variant.indexOf(nest.value.value) !== -1

          if (variation) {
            generateClasses(
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
        generateClasses(
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
        generateClasses(
          nest.body,
          variantMap,
          devMode,
          classes,
          modifier,
          pseudo,
          media +
            (media ? ' and ' : '') +
            generateMediaQueryFromNode(
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
