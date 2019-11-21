import traverseNode from './traverseNode'
import createPath from './createPath'
import normalizeVisitors from './normalizeVisitors'

export default function traverse(ast, visitors = [], context = {}) {
  const normalizedVisitors = normalizeVisitors(visitors)

  normalizedVisitors.forEach(visitor =>
    traverseNode(ast, visitor, createPath(ast, undefined, context))
  )

  return ast
}
