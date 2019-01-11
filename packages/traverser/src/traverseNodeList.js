import traverseNode from './traverseNode'

export default function traverseNodeList(list, visitor) {
  list.forEach(node => traverseNode(node, visitor))
}
