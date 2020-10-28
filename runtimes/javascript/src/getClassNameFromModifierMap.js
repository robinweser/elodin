export default function getClassNameFromModifierMap(
  className,
  modifierMap,
  props
) {
  return Object.keys(modifierMap)
    .map((modifier) =>
      Object.keys(modifierMap[modifier]).find(
        (key) => props[key] !== modifierMap[modifier][key]
      )
        ? undefined
        : className + modifier
    )
    .filter(Boolean)
    .join(' ')
}
