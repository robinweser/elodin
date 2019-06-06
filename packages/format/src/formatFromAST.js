const defaultConfig = {
  lineSpace: '\n\n',
  ident: '  ',
}

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

      return (
        fragments.map(generate).join(lineSpace) +
        (fragments.length > 0 ? lineSpace : '') +
        styles.map(generate).join(lineSpace)
      )

    case 'Style':
      return (
        'style ' +
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
        node.body.map(generate).join('\n' + ident) +
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
        node.body
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

    default:
      throw new Error('Unknown node: ', node.type)
  }
}
