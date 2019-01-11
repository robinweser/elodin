import definitions from './definitions'

export function validateDeclaration(property, value, rawValue) {
  const propertyDefinition = definitions[property]

  if (propertyDefinition) {
    const isValid = propertyDefinition.find(
      validator => validator(value) === true
    )

    if (!isValid) {
      return {
        type: 'value',
        message:
          'The value `' +
          rawValue +
          '` is invalid for the property `' +
          property +
          '`.',
        hint: '',
      }
    }

    return true
  }

  return {
    type: 'property',
    message: 'The property `' + property + '` is not a valid property.',
  }
}
