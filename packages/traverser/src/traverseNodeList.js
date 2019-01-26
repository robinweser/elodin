import traverseNode from './traverseNode'

export default function traverseNodeList(list, visitor, parentPath) {
  list.forEach(node => traverseNode(node, visitor, parentPath))
}
