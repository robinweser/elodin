import definitions from './definitions'
import functions from './functions'

export default function validateDeclaration(property, value, rawValue, format) {
  const propertyDefinition = definitions[format][property]

  if (propertyDefinition) {
    let val = value
    if (value.type === 'FunctionExpression') {
      const validator = functions[value.callee]

      if (validator) {
        if (typeof validator.return === 'function') {
          val = {
            type: validator.return(value.params),
          }
        } else {
          val = {
            type: validator.return,
          }
        }
      }
    }

    if (val.type === 'RawValue') {
      return true
    }

    const isValid = propertyDefinition.find(
      validator => validator(val) === true
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
  }
}
