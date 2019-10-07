import definitions from './definitions'

var Matcher = require('did-you-mean')

const matcher = {
  view: new Matcher(Object.keys(definitions.view).join(' ')),
  text: new Matcher(Object.keys(definitions.text).join(' ')),
}

export default function validateDeclaration(property, value, rawValue, format) {
  const propertyDefinition = format
    ? definitions[format][property]
    : definitions.view[property] || definitions.text[property]

  if (propertyDefinition) {
    const isValid = propertyDefinition.find(
      validator => validator(value) === true
    )

    if (!isValid) {
      return {
        type: 'value',
        format,
        message:
          'The value `' +
          rawValue +
          '` is invalid for the property `' +
          property +
          '`.',
      }
    }

    return true
  }

  return {
    type: 'property',
    format,
    message: 'The property `' + property + '` is not a valid property.',
    hint: matcher[format].get(property),
  }
}
