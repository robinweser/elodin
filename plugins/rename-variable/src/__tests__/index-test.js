import { traverse, parse } from '@elodin/core'

import renameVariable from '../index'

describe('Renaming variables', () => {
  it('should correctly rename variables', () => {
    const file = `style Button { paddingLeft: 10 paddingRight: $theme_colors_primary }`

    const ast = parse(file).ast

    expect(
      traverse(ast, [
        renameVariable({
          rename: (prop) => prop.split('_').join('.'),
        }),
      ])
    ).toMatchSnapshot()
  })
})
