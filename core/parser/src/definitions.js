import colorNames from './colorNames'

const COLOR_FUNCTIONS = /^(rgb|rgba|hsl|hsla)$/gi

const isInteger = (value) => value.type === 'Integer'
const isFloat = (value) => value.type === 'Float'
const isString = (value) => value.type === 'String'
const isPercentage = (value) =>
  value.type === 'Percentage' ||
  (value.type === 'FunctionExpression' && value.callee === 'percentage')
const isColor = (value) =>
  value.type === 'Color' ||
  (value.type === 'Identifier' && colorNames[value.value]) ||
  (value.type === 'FunctionExpression' &&
    value.callee.match(COLOR_FUNCTIONS) !== null)
const isNumber = (value) => isInteger(value) || isFloat(value)

const matchesKeywords = (...keywords) => (value) =>
  value.type === 'Identifier' &&
  Boolean(keywords.find((keyword) => value.value.indexOf(keyword) !== -1))

export default {
  // text styles
  fontSize: [isNumber],
  fontStyle: [matchesKeywords('normal', 'italic')],
  fontWeight: [
    (value) =>
      isInteger(value) &&
      value.value >= 100 &&
      value.value <= 900 &&
      value.value % 100 === 0,
    // matchesKeywords('normal', 'bold'),
  ],
  textAlign: [matchesKeywords('auto', 'justify', 'center', 'left', 'right')],
  textDecorationLine: [matchesKeywords('none', 'underline', 'lineThrough')],
  fontFamily: [isString],
  letterSpacing: [isNumber],
  lineHeight: [isNumber],
  color: [isColor],

  // view styles
  backgroundColor: [isColor],
  direction: [matchesKeywords('ltr', 'rtl')],
  position: [matchesKeywords('relative', 'absolute')],
  // display: [matchesKeywords('show', 'hide')],
  opacity: [isPercentage],

  // box model
  padding: [isNumber, isPercentage],
  paddingBottom: [isNumber, isPercentage],
  paddingTop: [isNumber, isPercentage],
  paddingLeft: [isNumber, isPercentage],
  paddingRight: [isNumber, isPercentage],
  margin: [isNumber, isPercentage],
  marginBottom: [isNumber, isPercentage],
  marginTop: [isNumber, isPercentage],
  marginLeft: [isNumber, isPercentage],
  marginRight: [isNumber, isPercentage],
  bottom: [isNumber, isPercentage],
  top: [isNumber, isPercentage],
  left: [isNumber, isPercentage],
  right: [isNumber, isPercentage],
  width: [isNumber, isPercentage],
  height: [isNumber, isPercentage],
  maxWidth: [isNumber, isPercentage],
  maxHeight: [isNumber, isPercentage],
  minWidth: [isNumber, isPercentage],
  minHeight: [isNumber, isPercentage],
  borderWidth: [isNumber],
  borderBottomWidth: [isNumber],
  borderTopWidth: [isNumber],
  borderLeftWidth: [isNumber],
  borderRightWidth: [isNumber],
  borderColor: [isColor],
  borderBottomColor: [isColor],
  borderTopColor: [isColor],
  borderLeftColor: [isColor],
  borderRightColor: [isColor],
  borderStyle: [matchesKeywords('none', 'solid', 'dotted', 'dashed')],
  borderRadius: [isNumber],
  borderTopLeftRadius: [isNumber],
  borderTopRightRadius: [isNumber],
  borderBottomLeftRadius: [isNumber],
  borderBottomRightRadius: [isNumber],

  // layout flow
  flexGrow: [isInteger],
  flexShrink: [isInteger],
  flexBasis: [isNumber, isPercentage, matchesKeywords('auto')],
  flexWrap: [matchesKeywords('nowrap', 'wrap')],
  flexDirection: [
    matchesKeywords('row', 'rowReverse', 'column', 'columnReverse'),
  ],
  justifyContent: [
    matchesKeywords(
      'flexStart',
      'flexEnd',
      'center',
      'spaceBetween',
      'spaceAround',
      'spaceEvenly'
    ),
  ],
  alignSelf: [
    matchesKeywords(
      'auto',
      'flexStart',
      'flexEnd',
      'center',
      'stretch',
      'baseline'
    ),
  ],
  alignItems: [
    matchesKeywords('flexStart', 'flexEnd', 'center', 'stretch', 'baseline'),
  ],
  alignContent: [
    matchesKeywords(
      'flexStart',
      'flexEnd',
      'center',
      'stretch',
      'spaceBetween',
      'spaceAround'
    ),
  ],
}
