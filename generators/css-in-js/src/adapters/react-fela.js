function stringifyDeclaration(declaration) {
  const prop = '"' +declaration.property + '":'

  if (typeof declaration.value === 'object') {
    return prop + '{' + declaration.value.map(stringifyDeclaration).join(',\n') + '}'
  }

  return prop + 'props.' + declaration.value
}

export default {
  name: 'react-fela',
  stringify: (declarations, className) =>
    "import './" +
    className +
    ".elodin.css'\n" +
    "import { createComponent } from 'react-fela'\n\n" +
    'function ' +
    className +
    '(props)' +
    ' {\n  ' +
    'return {\n    ' +
    "_className: '" +
    className +
    "',\n    " +
    declarations
      .map(stringifyDeclaration)
      .join(',\n    ') +
    '\n  }\n}\n\n' +
    'export default createComponent(' +
    className +
    ')',
}
