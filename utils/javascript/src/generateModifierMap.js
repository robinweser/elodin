export default function generateModifierMap(
  nodes,
  variantMap,
  config,
  modifierMap = {},
  variations = {},
  modifier = []
) {
  const {
    devMode,
    generateVariantName = (v) => v,
    generateVariantValue = (v) => v,
    variantSeparator = '_',
    valueSeparator = '-',
  } = config

  const nesting = nodes.filter((node) => node.type !== 'Declaration')
  const variantOrder = Object.keys(variantMap)
  // ensure the variant modifier order is always deterministic
  modifierMap[
    modifier
      .sort((a, b) =>
        variantOrder.indexOf(a[0]) > variantOrder.indexOf(b[0]) ? 1 : -1
      )
      .map(([name, value]) =>
        devMode
          ? '__' + name + valueSeparator + value
          : variantSeparator +
            variantOrder.indexOf(name) +
            valueSeparator +
            variantMap[name].indexOf(value)
      )
      .join('')
  ] = variations

  nesting.forEach((nest) => {
    if (nest.property.type === 'Identifier') {
      const variant = variantMap[nest.property.value]

      if (variant) {
        if (nest.value.type === 'Identifier') {
          const variation = variant.indexOf(nest.value.value) !== -1

          if (variation) {
            generateModifierMap(
              nest.body,
              variantMap,
              config,
              modifierMap,
              {
                ...variations,
                [generateVariantName(nest.property.value)]: generateVariantName(
                  nest.value.value
                ),
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

  return modifierMap
}
