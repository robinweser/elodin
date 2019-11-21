import { traverse } from '@elodin/core'

export default function escapeKeywords(
  ast,
  baseKeywords = [],
  caseSensitive = false
) {
  const keywords = baseKeywords.map(keyword =>
    caseSensitive ? keyword : keyword.toLowerCase()
  )

  return traverse(ast, [
    {
      Variant: {
        enter(path) {
          if (keywords.indexOf(path.node.name.toLowerCase()) !== -1) {
            path.node.name += '_'
          }

          path.node.body.forEach(variant => {
            if (keywords.indexOf(variant.value.toLowerCase()) !== -1) {
              variant.value += '_'
            }
          })
        },
      },
      Variable: {
        enter(path) {
          if (keywords.indexOf(path.node.value.toLowerCase()) !== -1) {
            path.node.value += '_'
          }
        },
      },
      Conditional: {
        enter(path) {
          if (keywords.indexOf(path.node.property.value.toLowerCase()) !== -1) {
            path.node.property.value += '_'
          }

          if (
            path.node.value &&
            path.node.value.type === 'Identifier' &&
            keywords.indexOf(path.node.value.value.toLowerCase()) !== -1
          ) {
            path.node.value.value += '_'
          }
        },
      },
    },
  ])
}
