const isInteger = value => value.type === 'Integer'
const isFloat = value => value.type === 'Float'
const isNumber = value => isInteger(value) || isFloat(value)

const matchesKeywords = (...keywords) => value =>
  value.type === 'Identifier' &&
  Boolean(keywords.find(keyword => value.value.indexOf(keyword) !== -1))
const isColor = value => {
  if (value.type === 'Identifier') {
    // TODO: add keywords
    return true
  }

  if (value.type === 'FunctionExpression') {
    if (value.callee === 'rgb') {
      // TODO: validate values
      return true
    }
  }
}

export default {
  backgroundColor: [isColor],

  // text
  fontSize: [isNumber],
  fontStyle: [matchesKeywords('bold', 'italic')],
  lineHeight: [isNumber],
  color: [isColor],

  // box model
  paddingBottom: [isNumber],
  paddingTop: [isNumber],
  paddingLeft: [isNumber],
  paddingRight: [isNumber],
  marginBottom: [isNumber],
  marginTop: [isNumber],
  marginLeft: [isNumber],
  marginRight: [isNumber],

  // layout flow
  flexGrow: [isInteger],
  flexShrink: [isInteger],
  flexBasis: [isNumber],
  flexDirection: [matchesKeywords('column', 'row')],
  alignSelf: [matchesKeywords('center', 'stretch', 'flex-end', 'flex-start')],
}
