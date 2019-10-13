import { hyphenateProperty } from 'css-in-js-utils'

export default function stringifyDeclaration({ property, value, media }) {
  if (media && typeof value === 'object') {
    return (
      'media("' +
      property +
      '", [' +
      value.map(stringifyDeclaration).join(',\n') +
      '])'
    )
  }

  if (typeof value === 'object') {
    return property + '([' + value.map(stringifyDeclaration).join(',\n') + '])'
  }

  return 'unsafe("' + hyphenateProperty(property) + '", ' + value + ')'
}
