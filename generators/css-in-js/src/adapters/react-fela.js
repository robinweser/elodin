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
  name: 'react-fela',
  stringify: ({ style, moduleName, classNameMap, className }) => {
    const hasVariations = Object.keys(classNameMap).length > 1

    return (
      "import './" +
      moduleName +
      ".elo.css'\n" +
      "import { createComponent } from 'react-fela'\n" +
      (hasVariations
        ? "import { getClassNameFromVariantMap } from '@elodin/runtime'\n\n" +
          'const variantMap = ' +
          JSON.stringify(classNameMap, null, 2) +
          '\n\n'
        : '\n') +
      'function ' +
      moduleName +
      '(props  = {})' +
      ' {\n  ' +
      'return {\n    ' +
      '_className: ' +
      (hasVariations
        ? "getClassNameFromVariantMap('" + className + "', variantMap, props)"
        : className) +
      ',\n    ' +
      style.map(stringifyDeclaration).join(',\n    ') +
      '\n  }\n}\n\n' +
      'export default createComponent(' +
      moduleName +
      ')'
    )
  },
}
