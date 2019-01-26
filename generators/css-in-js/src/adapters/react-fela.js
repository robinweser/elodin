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
  stringify: ({ style, moduleName, variants, className }) =>
    "import './" +
    moduleName +
    ".elo.css'\n" +
    "import { getClassNameWithVariants } from '@elodin/runtime'\n" +
    "import { createComponent } from 'react-fela'\n\n" +
    'const variants = ' +
    JSON.stringify(variants) +
    '\n\n' +
    'function ' +
    moduleName +
    '(props)' +
    ' {\n  ' +
    'return {\n    ' +
    "_className: getClassNameWithVariants('" +
    className +
    "', props, variants),\n    " +
    style.map(stringifyDeclaration).join(',\n    ') +
    '\n  }\n}\n\n' +
    'export default createComponent(' +
    moduleName +
    ')',
}
