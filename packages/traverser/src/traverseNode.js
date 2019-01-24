import traverseNodeList from './traverseNodeList'

export default function traverseNode(node, visitor) {
  const methods = visitor[node.type]

  if (methods && methods.enter) {
    methods.enter(node)
  }

  switch (node.type) {
    case 'File':
      traverseNodeList
    case 'Style':
    case 'Fragment':
      traverseNodeList(node.body, visitor)
      break

    case 'FunctionExpression':
      traverseNodeList(node.params, visitor)
      break

    case 'Conditional':
      traverseNode(node.property, visitor)
      traverseNode(node.value, visitor)
      traverseNodeList(node.body, visitor)
      break

    case 'Declaration':
      traverseNode(node.value, visitor)
      break

    case 'Variable':
    case 'Float':
    case 'NumericLiteral':
    case 'Identifier':
      break

    default:
      throw new TypeError(`Unkown Type ${node.type}`)
  }

  if (methods && methods.exit) {
    methods.exit(node)
  }
}
