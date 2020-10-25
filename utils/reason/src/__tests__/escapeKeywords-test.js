import { parse } from '@elodin/core'

import escapeKeywords from '../escapeKeywords'

describe('Escaping keywords', () => {
  it('should return a capitalized string', () => {
    const { ast } = parse(`
variant Type {
  Primary
  Secondary
}

style Button {
  color: $color
  backgroundColor: $bgColor
  
  [Type=Primary] {
    color: blue
  }
}
`)

    expect(
      escapeKeywords(ast, ['Type', 'Secondary', 'color'])
    ).toMatchSnapshot()
  })
})
