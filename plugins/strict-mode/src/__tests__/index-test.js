import { traverse, parse } from '@elodin/core'

import strictMode from '../index'

describe('Strict mode', () => {
  it('should correctly throw on variables', () => {
    const file = `style Button { paddingLeft: 10 }`

    const ast = parse(file).ast

    expect(traverse(ast, [strictMode()])).toMatchSnapshot()
  })
})
