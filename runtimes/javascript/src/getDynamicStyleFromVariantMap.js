const getPropMap = modifier => {
  return modifier
    .substr(2)
    .split('__')
    .map(pair => pair.split('-'))
}

export default function getDynamicStyleFromVariantMap(variantStyleMap, props) {
  return Object.keys(variantStyleMap).reduce((style, modifier) => {
    const propMap = getPropMap(modifier)

    if (propMap.find(([prop, value]) => props[prop] !== value)) {
      return style
    }

    return Object.assign(style, variantStyleMap[modifier](props))
  }, {})
}
