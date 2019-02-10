export default function getClassNameFromVariantMap(
  className,
  classNameMap,
  props
) {
  return Object.keys(classNameMap)
    .map(modifier => {
      Object.keys(classNameMap[modifier]).find(
        key => props[key] !== classNameMap[modifier][key]
      )
        ? undefined
        : className + modifier
    })
    .filter(Boolean)
    .join(' ')
}
