function stringifyDeclaration(declaration) {
  const prop = '"' + declaration.property + '":'

  if (typeof declaration.value === 'object') {
    return (
      prop + '{' + declaration.value.map(stringifyDeclaration).join(',\n') + '}'
    )
  }

  return prop + 'props.' + declaration.value
}

export default function reactFelaAdapter({
  style,
  moduleName,
  classNameMap,
  resetClassName,
  className,
  dynamicImport,
}) {
  const hasVariations = Object.keys(classNameMap).length > 1

  return (
    (!dynamicImport ? "import './" + moduleName + ".elo.css'\n" : '') +
    "import { createComponent } from 'react-fela'\n" +
    (hasVariations
      ? "import { getClassNameFromVariantMap } from '@elodin/runtime'\n\n" +
        'const variantMap = ' +
        JSON.stringify(classNameMap, null, 2) +
        '\n\n'
      : '\n') +
    'function ' +
    moduleName +
    'Style' +
    '(props  = {})' +
    ' {\n  ' +
    (dynamicImport ? "import('./" + moduleName + ".elo.css')\n" : '') +
    'return {\n    ' +
    '_className: ' +
    (hasVariations
      ? "'" +
        resetClassName +
        " ' + " +
        "getClassNameFromVariantMap('" +
        className +
        "', variantMap, props)"
      : "'" + resetClassName + ' ' + className + "'") +
    ',\n    ' +
    style.map(stringifyDeclaration).join(',\n    ') +
    '\n  }\n}\n\n' +
    'export const ' +
    moduleName +
    ' = createComponent(' +
    moduleName +
    'Style' +
    ')'
  )
}
