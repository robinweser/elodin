export default function flattenVariables(style, _ = []) {
  return style.reduce((vars, { value, property }) => {
    if (Array.isArray(value)) {
      return flattenVariables(value, vars)
    }

    return [...vars, value]
  }, _)
}
