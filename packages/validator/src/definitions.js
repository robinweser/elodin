const isInteger = value => value.type === 'Integer'
const isFloat = value => value.type === 'Float'
const isPercentage = value => value.type === 'Percentage'
const isNumber = value => isInteger(value) || isFloat(value)

const matchesKeywords = (...keywords) => value =>
  value.type === 'Identifier' &&
  Boolean(keywords.find(keyword => value.value.indexOf(keyword) !== -1))

const isColor = value => {
  // TODO: parse in parser
  if (value.type === 'Identifier') {
    return true
  }

  if (value.type === 'Color') {
    return true
  }
}

export default {
  view: {
    backgroundColor: [isColor],
    direction: [matchesKeywords('ltr', 'rtl')],
    position: [matchesKeywords('relative', 'absolute')],
    display: [matchesKeywords('show', 'hide')],
    opacity: [isPercentage],

    // box model
    paddingBottom: [isNumber, isPercentage],
    paddingTop: [isNumber, isPercentage],
    paddingLeft: [isNumber, isPercentage],
    paddingRight: [isNumber, isPercentage],
    marginBottom: [isNumber, isPercentage],
    marginTop: [isNumber, isPercentage],
    marginLeft: [isNumber, isPercentage],
    marginRight: [isNumber, isPercentage],
    offsetBottom: [isNumber, isPercentage],
    offsetTop: [isNumber, isPercentage],
    offsetLeft: [isNumber, isPercentage],
    offsetRight: [isNumber, isPercentage],
    width: [isNumber, isPercentage],
    height: [isNumber, isPercentage],
    maxWidth: [isNumber, isPercentage],
    maxHeight: [isNumber, isPercentage],
    minWidth: [isNumber, isPercentage],
    minHeight: [isNumber, isPercentage],
    borderBottomWidth: [isNumber],
    borderTopWidth: [isNumber],
    borderLeftWidth: [isNumber],
    borderRightWidth: [isNumber],
    borderBottomColor: [isColor],
    borderTopColor: [isColor],
    borderLeftColor: [isColor],
    borderRightColor: [isColor],
    borderStyle: [matchesKeywords('solid', 'dotted', 'dashed')],
    borderTopLeftRadius: [isNumber],
    borderTopRightRadius: [isNumber],
    borderBottomLeftRadius: [isNumber],
    borderBottomRightRadius: [isNumber],

    // layout flow
    flexGrow: [isInteger],
    flexShrink: [isInteger],
    flexBasis: [isNumber, isPercentage],
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
    alignItems: [
      matchesKeywords(
        'flexStart',
        'flexEnd',
        'center',
        'stretch',
        'spaceBetween',
        'spaceAround'
      ),
    ],
  },

  text: {
    // text
    fontSize: [isNumber],
    fontStyle: [matchesKeywords('bold', 'italic')],
    textAlign: [matchesKeywords('center', 'left', 'right')],
    lineHeight: [isNumber],
    color: [isColor],
  },
}
