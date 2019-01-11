import traverseNode from './traverseNode'

export default function traverse(ast, visitors = []) {
  visitors.forEach(visitor => traverseNode(ast, visitor))

  return ast
}
