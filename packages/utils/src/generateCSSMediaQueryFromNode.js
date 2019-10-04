export default function generateCSSMediaQueryFromNode(
  value,
  property,
  operator
) {
  if (operator && value) {
    const dimension = property.indexOf('Height') !== -1 ? 'height' : 'width'

    if (operator === '=') {
      return (
        '(min-' +
        dimension +
        ': ' +
        value +
        'px) and (max-' +
        dimension +
        ': ' +
        value +
        'px)'
      )
    }

    if (operator === '>') {
      return '(min-' + dimension + ': ' + (value + 1) + 'px)'
    }

    if (operator === '>=') {
      return '(min-' + dimension + ': ' + value + 'px)'
    }

    if (operator === '<=') {
      return '(max-' + dimension + ': ' + value + 'px)'
    }

    if (operator === '<') {
      return '(max-' + dimension + ': ' + (value - 1) + 'px)'
    }
  } else {
    return '(orientation: ' + property + ')'
  }
}
