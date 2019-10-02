const defaultSelector = (variables, property) => variables[property]

// available formats: rgb, hsl, hex, keyword
const defaultConfig = {
  format: 'rgb',
}

export default function color(customConfig = {}) {
  const { format } = {
    ...defaultConfig,
    ...customConfig,
  }

  return {
    Color: {
      enter(path) {
        path.node.format = format
      },
    },
  }
}
