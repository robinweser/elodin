export default function print(path) {
  const node = path.getValue()

  if (node.ast_type === 'elodin-ast') {
    return node.body
  }

  if (process.env.NODE_ENV === 'test') {
    throw new Error('Unknown elodin node: ' + JSON.stringify(node, null, 2))
  }
  // tslint:disable-next-line:no-console
  console.error('Unknown elodin node:', node)
  return node.source
}
