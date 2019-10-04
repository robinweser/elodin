export default function renameVariable({ rename } = {}) {
  if (!rename) {
    throw new Error(
      'You have to pass a rename function to use the @elodin/plugin-rename-variable.'
    )
  }

  return {
    Declaration: {
      enter(path) {
        if (
          path.node.value.type === 'Variable' &&
          !path.node.value.environment
        ) {
          path.node.value.value = rename(path.node.value.value)
        }
      },
    },
  }
}
