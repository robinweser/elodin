import { traverse } from '@elodin/core'

export default function getVariablesFromAST(ast) {
  const vars = []

  traverse(ast, [
    {
      Variable: {
        enter(path) {
          if (!path.node.environment) {
            vars.push(path.node.value)
          }
        },
      },
    },
  ])

  return vars.filter((va, index) => vars.indexOf(va) === index)
}
