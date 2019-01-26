import Color from 'color'

export default function lighten(color, percentage, type = 'rgb') {
  return Color(color)
    .lighten(percentage)
    [type]()
    .string()
}
