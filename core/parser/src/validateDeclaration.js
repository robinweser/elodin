import definitions from './definitions'
import functions from './functions'
import meant from 'meant'

const properties = Object.keys(definitions)

export default function validateDeclaration(property, value, rawValue) {
  const propertyDefinition = definitions[property]

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

  const hints = meant(property, properties)

  return {
    type: 'property',
    message: 'The property `' + property + '` is not a valid property.',
    hint: hints ? hints[0] : undefined,
  }
}
