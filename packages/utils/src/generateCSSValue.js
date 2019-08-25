import { isUnitlessProperty, hyphenateProperty } from 'css-in-js-utils'
import color from 'color'

export default function generateCSSValue(value, property, unit = true) {
  if (value.type === 'Integer') {
    return (
      (value.negative ? '-' : '') +
      value.value +
      (unit && !isUnitlessProperty(property) ? 'px' : '')
    )
  }

  if (value.type === 'RawValue' || value.type === 'String') {
    return value.value
  }

  if (value.type === 'Percentage') {
    if (property === 'opacity') {
      return value.value / 100
    } else {
      return value.value + '%'
    }
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
