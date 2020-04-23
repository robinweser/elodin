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
  percentage: true,
}

const colorFn = {
  negate: true,
  lighten: true,
  darken: true,
  saturate: true,
  desaturate: true,
  fade: true,
  opaquer: true,
}

export default function generateValue(
  value,
  property,
  unit = true,
  floatingPercentage = false
) {
  if (value.type === 'Integer') {
    return (
      (value.negative ? '-' : '') +
      value.value +
      (unit && !isUnitlessProperty(property) ? 'px' : '')
    )
  }

  if (value.type === 'FunctionExpression') {
    return generateFunction(value, property, unit, floatingPercentage)
  }

  if (value.type === 'String') {
    return value.value
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

  if (value.type === 'Variable') {
    return 'var(--' + hyphenateProperty(value.value) + ')'
  }

  return value.value
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

function generateFunction(value, property, unit, floatingPercentage = false) {
  if (value.callee === 'raw') {
    return generateValue(value.params[0], property, false)
  }

  if (value.callee === 'percentage') {
    if (floatingPercentage || property === 'opacity') {
      return parseFloat(generateValue(value.params[0], property, false)) / 100
    }

    return generateValue(value.params[0], property, false) + '%'
  }

  if (math[value.callee]) {
    return generateValue(
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
        .map((param) => generateValue(param, property, false, true))
        .join(', ') +
      ')'
    )
  }

  if (colorFn[value.callee]) {
    const colorValue = generateValue(value.params[0], property, false, false)
    if (value.callee === 'negate') {
      return color(colorValue).negate().string()
    }

    const percentage = generateValue(value.params[1], property, false, true)

    return color(colorValue)[value.callee](percentage).string()
  }
}
