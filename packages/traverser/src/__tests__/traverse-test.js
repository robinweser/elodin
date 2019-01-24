import { parse } from '@elodin/parser'

import traverse from '../traverse'

describe('Traversing ast nodes', () => {
  it('should correctly traverse nodes', () => {
    const file = `
style Button {
  color: red
  [Type=Primary] {
    color: blue
  }
}`

    const log = []

    const visitor = {
      Identifier: {
        enter(node) {
          log.push(node.value)
          node.value = node.value.toUpperCase()
          log.push(node.value)
        },

        exit(node) {
          log.push(node.value)
        },
      },
    }

    const { ast } = parse(file)

    expect(traverse(ast, [visitor])).toMatchSnapshot()
    expect(log).toMatchSnapshot()
  })
})
