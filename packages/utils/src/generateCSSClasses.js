import { hyphenateProperty } from 'css-in-js-utils'

import getCSSMediaQueryFromNode from './getCSSMediaQueryFromNode'
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
  variants,
  classes = [],
  modifier = '',
  pseudo = '',
  media = ''
) {
  const base = nodes.filter(node => node.type === 'Declaration')
  const nesting = nodes.filter(node => node.type !== 'Declaration')

  classes.push({
    media,
    pseudo,
    modifier,
    declarations: getStaticDeclarations(base),
  })

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
            generateCSSClasses(
              nest.body,
              variants,

              classes,
              // TODO: variants in deterministic order
              modifier + '__' + variant.name + '-' + variation.value,
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
      if (nest.boolean) {
        const pseudoClass = isPseudoClass(nest.property.value)
        const pseudoElement = isPseudoElement(nest.property.value)

        if (pseudoClass || pseudoElement) {
          generateCSSClasses(
            nest.body,
            variants,

            classes,
            modifier,
            pseudo +
              (pseudoElement ? '::' : ':') +
              hyphenateProperty(nest.property.value),
            media
          )
        }
      }

      if (isMediaQuery(nest.property.value)) {
        generateCSSClasses(
          nest.body,
          variants,

          classes,
          modifier,
          pseudo,
          getCSSMediaQueryFromNode(
            nest.value.value,
            nest.property.value,
            nest.operator
          )
        )
      }
    }
  })

  return classes
}
