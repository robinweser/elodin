import { traverse, parse } from '@elodin/core'

import replaceVariable from '../index'

describe('Replacing variables', () => {
  it('should correctly replace variables', () => {
    const file = `view Button { paddingLeft: 10 paddingRight: $spacingXL }`

    const ast = parse(file).ast

    expect(
      traverse(ast, [
        replaceVariable({
          spacingL: 10,
          spacingXL: 20,
        }),
      ])
    ).toMatchSnapshot()
  })

  it('should work with custom selectors', () => {
    const file = `view Button { paddingLeft: 10 backgroundColor: $colors_primary }`

    const ast = parse(file).ast

    expect(
      traverse(ast, [
        replaceVariable(
          {
            colors: {
              primary: 'red',
              secondary: 'blue',
            },
          },
          (variables, property) =>
            property
              .split('_')
              .reduce((out, prop) => (out ? out[prop] : undefined), variables)
        ),
      ])
    ).toMatchSnapshot()
  })
})
