import traverse from './traverse'

export default function createPath(node, parentPath, context) {
  const traverser = visitors => traverse(node, [].concat(visitors), context)

  const restoredParentPath = parentPath || context.parentPath
  // if we don't have a parentPath (AST entry)
  // we can't have replaceNode, removeNode, parent and parentNode
  if (!restoredParentPath) {
    return {
      node,
      context,
      traverse: traverser,
    }
  }

  const parentNode = restoredParentPath.node
  const container = parentNode.body || parentNode.params

  const path = {
    parentPath: restoredParentPath,
    parent: parentNode,
    node,
    context,
    traverse: traverser,
    replaceNode(newNode) {
      if (container) {
        const nodeIndex = container.indexOf(node)
        container[nodeIndex] = newNode
        path.node = newNode
      }
    },
    removeNode() {
      if (container) {
        const nodeIndex = container.indexOf(node)
        container.splice(nodeIndex, 1)
      }
    },
  }

  return path
}
