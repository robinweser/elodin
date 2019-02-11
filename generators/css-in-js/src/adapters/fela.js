function stringifyDeclaration(declaration) {
  const prop = '"' + declaration.property + '":'

  if (typeof declaration.value === 'object') {
    return (
      prop + '{' + declaration.value.map(stringifyDeclaration).join(',\n') + '}'
    )
  }

  return prop + 'props.' + declaration.value
}

export default {
  name: 'fela',
  stringify: ({ style, className, classNameMap, moduleName }) => {
    const hasVariations = Object.keys(classNameMap).length > 1

    return (
      "import './" +
      moduleName +
      ".elo.css'\n" +
      (hasVariations
        ? "import { getClassNameFromVariantMap } from '@elodin/runtime'\n\n" +
          'const variantMap = ' +
          JSON.stringify(classNameMap, null, 2) +
          '\n\n'
        : '\n') +
      'export function ' +
      moduleName +
      '(props = {})' +
      ' {\n  ' +
      'return {\n    ' +
      '_className: ' +
      (hasVariations
        ? "getClassNameFromVariantMap('" + className + "', variantMap, props)"
        : "'" + className "'") +
      ',\n    ' +
      style.map(stringifyDeclaration).join(',\n    ') +
      '\n  }\n}'
    )
  },
}
