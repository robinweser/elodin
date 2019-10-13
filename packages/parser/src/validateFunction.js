import functions from './functions'

function stringifyTypes(types) {
  if (types.length === 1) {
    return '<' + types[0] + '>'
  }

  const last = types.pop()

  return (
    types.map(type => '<' + type + '>').join(', ') +
    ' or ' +
    stringifyTypes([last])
  )
}

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
          return {
            type: 'type',
            message:
              'Found parameter ' +
              (index + 1) +
              ' of type <' +
              type +
              '> in ' +
              callee +
              ', but wanted ' +
              stringifyTypes(validator.types) +
              '.',
          }
        }
        return isValid
      }, true)
    }

    if (params.length > validator.params.length) {
      return {
        type: 'length',
        message:
          callee +
          'only accepts ' +
          validator.params.length +
          ' parameters where ' +
          params.length +
          ' were passed.',
      }
    }

    if (params.length < validator.params.length) {
      return {
        type: 'length',
        message:
          callee +
          'requires ' +
          validator.params.length +
          ' parameters. Only ' +
          params.length +
          ' found.',
      }
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
        return {
          type: 'type',
          message:
            'Found parameter ' +
            (index + 1) +
            ' of type <' +
            type +
            '> in ' +
            callee +
            ', but wanted ' +
            stringifyTypes([paramValidator.type]) +
            '.',
        }
      }

      if (paramValidator.validate) {
        const isValidParamValue = paramValidator.validate(param)

        if (!isValidParamType) {
          return {
            type: 'type',
            message:
              'Found parameter ' +
              (index + 1) +
              ' of type <' +
              param.type +
              '> in ' +
              callee +
              ' with an invalid value.',
          }
        }
      }

      return isValid
    }, true)
  }

  return {
    type: 'callee',
    message: 'The function `' + callee + '` is not a valid function.',
  }
}
