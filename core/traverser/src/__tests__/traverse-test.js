import { parse } from '@elodin/parser'

import traverse from '../traverse'

describe('Traversing ast nodes', () => {
  it('should correctly traverse nodes', () => {
    const file = `
view Button {
  color: red
  [Type=Primary] {
    color: blue
  }
}`

    const log = []

    const visitor = {
      Identifier: {
        enter(path) {
          log.push(path.node.value)
          path.node.value = path.node.value.toUpperCase()
          log.push(path.node.value)
        },

        exit(path) {
          log.push(path.node.value)
        },
      },
    }

    const { ast } = parse(file)

    expect(traverse(ast, [visitor])).toMatchSnapshot()
    expect(log).toMatchSnapshot()
  })
})
