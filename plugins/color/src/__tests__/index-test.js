import { traverse, parse } from '@elodin/core'

import color from '../index'

describe('Replacing variables', () => {
  it('should correctly replace variables', () => {
    const file = `view Button { backgroundColor: red borderBottomColor: rgb(255 100 50) }`

    const ast = parse(file).ast

    expect(traverse(ast, [color('hex')])).toMatchSnapshot()
  })
})
