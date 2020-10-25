import { traverse, parse } from '@elodin/core'

import replaceVariable from '../index'

describe('Replacing variables', () => {
  it('should correctly replace variables in declarations', () => {
    const file = `style Button { paddingLeft: 10 paddingRight: $spacingXL }`

    const ast = parse(file).ast

    expect(
      traverse(ast, [
        replaceVariable({
          variables: {
            spacingL: 10,
            spacingXL: 20,
          },
        }),
      ])
    ).toMatchSnapshot()
  })
  it('should correctly replace variables in functions', () => {
    const file = `style Button { paddingLeft: 10 paddingRight: add($spacingXL 1) }`

    const ast = parse(file).ast

    expect(
      traverse(ast, [
        replaceVariable({
          variables: {
            spacingL: 10,
            spacingXL: 20,
          },
        }),
      ])
    ).toMatchSnapshot()
  })

  it('should correctly replace variables in conditions', () => {
    const file = `style Button { paddingLeft: 10 [@viewportWidth>=$fromM] { paddingLeft: 20 } }`

    const ast = parse(file).ast

    expect(
      traverse(ast, [
        replaceVariable({
          variables: {
            fromM: 480,
          },
        }),
      ])
    ).toMatchSnapshot()
  })

  it('should work with custom selectors', () => {
    const file = `style Button { paddingLeft: 10 backgroundColor: $colors_primary }`

    const ast = parse(file).ast

    expect(
      traverse(ast, [
        replaceVariable({
          variables: {
            colors: {
              primary: 'red',
              secondary: 'blue',
            },
          },

          selector: (variables, property) =>
            property
              .split('_')
              .reduce((out, prop) => (out ? out[prop] : undefined), variables),
        }),
      ])
    ).toMatchSnapshot()
  })
})
