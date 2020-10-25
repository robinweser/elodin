const defaultSelector = (variables, property) => variables[property]

const defaultConfig = {
  selector: defaultSelector,
}

export default function replaceVariable(customConfig = {}) {
  const { variables, selector } = {
    ...defaultConfig,
    ...customConfig,
  }

  return {
    FunctionExpression: {
      enter(path) {
        path.node.params = path.node.params.map((param) => {
          if (param.type === 'Variable' && !param.environment) {
            const value = selector(variables, param.value)

            if (value) {
              if (typeof value === 'number') {
                return {
                  type: 'Integer',
                  value,
                }
              }

              if (typeof value === 'string') {
                return {
                  type: 'Identifier',
                  value,
                }
              }
            }
          } else {
            return param
          }
        })
      },
    },
    Conditional: {
      enter(path) {
        if (
          !path.node.boolean &&
          path.node.value.type === 'Variable' &&
          !path.node.value.environment
        ) {
          const value = selector(variables, path.node.value.value)

          if (value) {
            if (typeof value === 'number') {
              path.replaceNode({
                ...path.node,
                value: {
                  type: 'Integer',
                  value,
                },
              })
            }

            if (typeof value === 'string') {
              path.replaceNode({
                ...path.node,
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
