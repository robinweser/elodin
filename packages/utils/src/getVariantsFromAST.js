import { traverse } from '@elodin/core'

export default function getVariantsFromAST(ast) {
  const vars = {}

  traverse(ast, [
    {
      Conditional: {
        enter(path) {
          if (path.node.property.type === 'Identifier') {
            if (!vars[path.node.property.value]) {
              vars[path.node.property.value] = []
            }

            if (
              vars[path.node.property.value].indexOf(
                path.node.property.value
              ) === -1
            ) {
              vars[path.node.property.value] = [
                ...vars[path.node.property.value],
                path.node.property.value,
              ]
            }
          }
        },
      },
    },
  ])

  return vars
}
