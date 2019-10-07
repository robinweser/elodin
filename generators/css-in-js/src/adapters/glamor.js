function stringifyDeclaration(declaration) {
  const prop = '"' + declaration.property + '":'

  if (typeof declaration.value === 'object') {
    return (
      prop + '{' + declaration.value.map(stringifyDeclaration).join(',\n') + '}'
    )
  }

  return prop + declaration.value
}

const defaultConfig = {
  dynamicImport: false,
}

export default function glamorAdapter(customConfig = {}) {
  const { dynamicImport } = {
    ...defaultConfig,
    ...customConfig,
  }

  return ({
    style,
    variantStyleMap,
    className,
    variables,
    cssFileName,
    resetClassName,
    classNameMap,
    moduleName,
  }) => {
    const hasVariations = Object.keys(classNameMap).length > 1
    const hasDynamicVariations = Object.keys(variantStyleMap).length > 0

    const imports = [
      hasVariations ? 'getClassNameFromVariantMap' : undefined,
      hasDynamicVariations ? 'getDynamicStyleFromVariantMap' : undefined,
    ].filter(Boolean)

    return (
      (!dynamicImport ? "import './" + cssFileName + ".css'\n" : '') +
      "import { css } from 'glamor'\n" +
      (imports.length > 0
        ? 'import { ' + imports.join(', ') + " } from '@elodin/runtime'\n\n"
        : '\n') +
      (hasVariations
        ? 'const variantClassNameMap = ' +
          JSON.stringify(classNameMap, null, 2) +
          '\n\n'
        : '') +
      (hasDynamicVariations
        ? 'const variantStyleMap = {\n' +
          Object.keys(variantStyleMap)
            .map(
              modifier =>
                "'" +
                modifier +
                "'" +
                ': ({ ' +
                variables.join(', ') +
                ' }) => ({\n  ' +
                variantStyleMap[modifier]
                  .map(stringifyDeclaration)
                  .join(',\n  ') +
                '\n})'
            )
            .join(',\n') +
          '\n}' +
          '\n\n'
        : '') +
      'export function ' +
      moduleName +
      '(props = {})' +
      ' {\n  ' +
      (dynamicImport ? "import('./" + cssFileName + ".css')\n  " : '') +
      'const { ' +
      variables.join(', ') +
      ' } = props\n\n  ' +
      'const className = ' +
      (hasVariations
        ? "'" +
          resetClassName +
          " ' + " +
          "getClassNameFromVariantMap('" +
          className +
          "', variantClassNameMap, props)"
        : "'" + resetClassName + ' ' + className + "'") +
      '\n\n  ' +
      'return className + " " + css({\n    ' +
      style.map(stringifyDeclaration).join(',\n    ') +
      (hasDynamicVariations
        ? ',\n    ...getDynamicStyleFromVariantMap(variantStyleMap, props)'
        : '') +
      '\n  })\n}'
    )
  }
}
