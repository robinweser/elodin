import { traverse, parse } from '@elodin/core'

import color from '../index'

describe('Normalizing colors', () => {
  it('should correctly set color formats', () => {
    const file = `view Button { backgroundColor: red borderBottomColor: rgb(255 100 50) }`

    const ast = parse(file).ast

    expect(traverse(ast, [color()])).toMatchSnapshot()
  })
})
