import { hyphenateProperty } from 'css-in-js-utils'

export default function stringifyRule(declarations, name, indent = '') {
  return (
    indent +
    '.' +
    name +
    ' {\n  ' +
    indent +
    declarations
      .map(decl => hyphenateProperty(decl.property) + ': ' + decl.value)
      .join(';\n  ' + indent) +
    '\n' +
    indent +
    '}'
  )
}
