export default function generateClassNameMap(
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
