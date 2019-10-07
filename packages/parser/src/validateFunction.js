import functions from './functions'

export default function validateFunction(callee, params) {
  const validator = functions[callee]

  if (validator) {
    // param list
    if (validator.types) {
      return params.reduce((isValid, param, index) => {
        let type = param.type

        if (type === 'Variable') {
          return isValid
        }

        if (type === 'FunctionExpression') {
          const isValidFunction = validateFunction(param.callee, param.params)
          const returnType = functions[param.callee].return

          if (typeof returnType === 'function') {
            type = returnType(params)
          } else {
            type = returnType
          }
        }

        const isValidParam = validator.types.indexOf(type) !== -1

        if (!isValidParam) {
          console.log(
            'Found parameter ' +
              (index + 1) +
              ' of type ' +
              type +
              ', but wanted ' +
              validator.types.join(', ')
          )
          return false
        }
        return isValid
      }, true)
    }

    if (params.length > validator.params.length) {
      console.log('Too much arguments.')
      return false
    }

    if (params.length < validator.params.length) {
      console.log('Not enough params.')
      return false
    }

    return params.reduce((isValid, param, index) => {
      let type = param.type

      if (type === 'Variable') {
        return isValid
      }

      if (type === 'FunctionExpression') {
        const isValidFunction = validateFunction(param.callee, param.params)
        const returnType = functions[param.callee].return

        if (typeof returnType === 'function') {
          type = returnType(params)
        } else {
          type = returnType
        }
      }

      const paramValidator = validator.params[index]
      const isValidParamType = type === paramValidator.type

      if (!isValidParamType) {
        console.log(
          'Found parameter ' +
            (index + 1) +
            ' of type ' +
            type +
            ', but wanted ' +
            paramValidator.type
        )
        return false
      }

      if (paramValidator.validate) {
        const isValidParamValue = paramValidator.validate(param)

        if (!isValidParamType) {
          console.log(
            'Found parameter ' +
              (index + 1) +
              ' of type ' +
              param.type +
              ', with invalid value'
          )
          return false
        }
      }

      return isValid
    }, true)
  }

  console.log('Invalid function call ' + callee)
  return false
}
