const defaultSelector = (variables, property) => variables[property]

export default function replaceVariable(variables, selector = defaultSelector) {
  return {
    Declaration: {
      enter(path) {
        if (
          path.node.value.type === 'Variable' &&
          !path.node.value.environment
        ) {
          const value = selector(variables, path.node.value.value)

          if (value) {
            if (typeof value === 'number') {
              path.replaceNode({
                ...path.node,
                dynamic: false,
                value: {
                  type: 'Integer',
                  value,
                },
              })
            }

            if (typeof value === 'string') {
              path.replaceNode({
                ...path.node,
                dynamic: false,
                value: {
                  type: 'Identifier',
                  value,
                },
              })
            }
          }
        }
      },
    },
  }
}
