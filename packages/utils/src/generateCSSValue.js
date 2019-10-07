import { isUnitlessProperty, hyphenateProperty } from 'css-in-js-utils'
import color from 'color'

const math = {
  add: true,
  sub: true,
  mul: true,
  div: true,
}

const stringFn = {
  rgba: true,
  rgb: true,
  hsl: true,
  hsla: true,
}

function resolveMath(value) {
  if (value.callee === 'add') {
    return value.params.reduce((sum, param) => sum + resolveMath(param), 0)
  }

  if (value.callee === 'sub') {
    return value.params.reduce(
      (sum, param) => sum - resolveMath(param),
      resolveMath(value.params[0]) * 2
    )
  }

  if (value.callee === 'mul') {
    return value.params.reduce((sum, param) => sum * resolveMath(param), 1)
  }

  // if (value.callee === 'add') {
  //   return value.params.reduce((sum, param) => sum + resolveMath(param), 0)
  // }

  return value.value
}

function generateFunction(value, property, unit) {
  if (value.callee === 'raw') {
    return generateCSSValue(value.params[0], property, false)
  }

  if (value.callee === 'percentage') {
    return generateCSSValue(value.params[0], property, false) + '%'
  }

  if (math[value.callee]) {
    return generateCSSValue(
      {
        type: 'Integer',
        value: resolveMath(value),
      },
      property,
      unit
    )
  }

  if (stringFn[value.callee]) {
    return (
      value.callee +
      '(' +
      value.params
        .map(param => generateCSSValue(param, property, false))
        .join(', ') +
      ')'
    )
  }
}

export default function generateCSSValue(value, property, unit = true) {
  if (value.type === 'Integer') {
    return (
      (value.negative ? '-' : '') +
      value.value +
      (unit && !isUnitlessProperty(property) ? 'px' : '')
    )
  }

  if (value.type === 'FunctionExpression') {
    return generateFunction(value, property, unit)
  }

  if (value.type === 'String') {
    return value.value
  }

  if (value.type === 'Color') {
    const { format, red, blue, green, alpha } = value

    const colorValue = color.rgb(red, green, blue, alpha)
    if (format === 'hex') {
      return colorValue.hex()
    }

    if (format === 'keyword') {
      // TODO: check APIs
      return colorValue.keyword()
    }

    return colorValue[format]().string()
  }

  if (value.type === 'Float') {
    return (
      (value.negative ? '-' : '') +
      value.integer +
      '.' +
      value.fractional +
      (unit && !isUnitlessProperty(property) ? 'px' : '')
    )
  }

  if (value.type === 'Identifier') {
    return hyphenateProperty(value.value)
  }

  return value.value
}
