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
  stringify: ({ style, className, moduleName, variants }) =>
    "import './" +
    moduleName +
    ".elo.css'\n" +
    "import { getClassNameWithVariants } from '@elodin/runtime'\n\n" +
    'const variants = ' +
    JSON.stringify(variants) +
    '\n\n' +
    'export function ' +
    moduleName +
    '(props)' +
    ' {\n  ' +
    'return {\n    ' +
    "_className: getClassNameWithVariants('" +
    className +
    "', props, variants),\n    " +
    style.map(stringifyDeclaration).join(',\n    ') +
    '\n  }\n}',
}
