const defaultSelector = (variables, property) => variables[property]

// available formats: rgb, hsl, hex, keyword
export default function color(format = 'rgb') {
  return {
    Color: {
      enter(path) {
        path.node.format = format
      },
    },
  }
}
