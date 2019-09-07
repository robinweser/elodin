import color from 'color'

const defaultConfig = {
  lineSpace: '\n\n',
  ident: '  ',
}

const sortDeclarations = body => [
  ...body.filter(node => node.raw),
  ...body.filter(node => !node.raw),
]

export default function formatFromAST(node, customConfig = {}, level = 1) {
  const config = {
    ...defaultConfig,
    ...customConfig,
  }

  const generate = node => formatFromAST(node, config, level)
  const generateWithLevel = newLevel => node =>
    formatFromAST(node, config, newLevel)

  const { lineSpace, ident } = config

  switch (node.type) {
    case 'File':
      const fragments = node.body.filter(node => node.type === 'Fragment')
      const styles = node.body.filter(node => node.type === 'Style')
      const variants = node.body.filter(node => node.type === 'Variant')

      return (
        variants.map(generate).join(lineSpace) +
        (variants.length > 0 ? lineSpace : '') +
        fragments.map(generate).join(lineSpace) +
        (fragments.length > 0 ? lineSpace : '') +
        styles.map(generate).join(lineSpace)
      )

    case 'Style':
      return (
        node.format +
        ' ' +
        node.name +
        ' {\n' +
        ident +
        sortDeclarations(node.body)
          .map(generate)
          .join('\n' + ident) +
        '\n}'
      )

    case 'Variant':
      return (
        'variant ' +
        node.name +
        ' {\n' +
        ident +
        node.body.map(generate).join('\n' + ident) +
        '\n}'
      )

    case 'Fragment':
      return (
        'fragment ' +
        node.name +
        ' {\n' +
        ident +
        sortDeclarations(node.body)
          .map(generate)
          .join('\n' + ident) +
        '\n}'
      )

    case 'Conditional':
      const newLevel = level + 1

      return (
        '[' +
        (node.boolean
          ? generate(node.property)
          : generate(node.property) + node.operator + generate(node.value)) +
        '] {\n' +
        ident.repeat(newLevel) +
        sortDeclarations(node.body)
          .map(generateWithLevel(newLevel))
          .join('\n' + ident.repeat(newLevel)) +
        '\n' +
        ident.repeat(level) +
        '}'
      )

    case 'FunctionExpression':
      return node.callee + '(' + node.params.map(generate).join(' ') + ')'

    case 'Declaration':
      return (
        (node.raw ? '__' : '') + node.property + ': ' + generate(node.value)
      )

    case 'Variable':
      return (node.environment ? '@' : '$') + node.value

    case 'Float':
      return (
        (node.negative ? '-' : '') +
        (node.integer > 0 ? node.integer : '') +
        '.' +
        node.fractional
      )

    case 'Integer':
      return (node.negative ? '-' : '') + node.value
    case 'Identifier':
      return node.value
    case 'RawValue':
      return 'raw("' + node.value + '")'
    case 'Percentage':
      return 'percentage(' + node.value + ')'
    case 'String':
      return '"' + node.value + '"'

    case 'Color':
      const { format, red, blue, green, alpha } = node
      const colorValue = color.rgb(red, green, blue, alpha)

      if (format === 'hex') {
        return 'hex(' + colorValue.hex().substr(1) + ')'
      }

      if (format === 'keyword') {
        // TODO: check APIs
        return colorValue.keyword()
      }

      if (node.alpha < 1) {
        if (format === 'rgb') {
          return (
            'rgba(' +
            [
              node.red,
              node.green,
              node.blue,
              'percentage(' + node.alpha * 100 + ')',
            ].join(' ') +
            ')'
          )
        } else {
          'hsla(' +
            [
              node.hue,
              node.saturation,
              node.lumination,
              'percentage(' + node.alpha * 100 + ')',
            ].join(' ') +
            ')'
        }
      }

      return colorValue[format]()
        .string()
        .replace(/,/g, '')

    default:
      throw new Error('Unknown node: ', node.type)
  }
}
