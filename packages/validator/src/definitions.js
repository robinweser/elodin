const isNumber = value => value.type === 'NumericLiteral'
const isFloat = value => value.type === 'Float'
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
  color: [isColor],
  backgroundColor: [isColor],
  borderColor: [isColor],
  borderWidth: [isNumber],
  borderType: [matchesKeywords('solid', 'dotted')],
  fontSize: [isNumber],
  lineHeight: [isNumber, isFloat],
  flexDirection: [matchesKeywords('column', 'row')],
  flexGrow: [isNumber],
  flexShrink: [isNumber],
  flexBasis: [isNumber, matchesKeywords('auto')],
  alignSelf: [matchesKeywords('center', 'stretch', 'flex-end', 'flex-start')],
}
