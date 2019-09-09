import { parse } from '@elodin/parser'

import { createGenerator } from '../index'

const file = `
view Button {
  backgroundColor: red
  paddingLeft: 10
  alignItems: $alignItems
}

view Box {
  paddingTop: 10
}

text Label {
  lineHeight: $lineHeight
  fontSize: 12
}`

describe('Compiling to CSS and JavaScript', () => {
  it('should return a map of files', () => {
    const { ast } = parse(file)

    expect(createGenerator()(ast, 'style.elo')).toMatchSnapshot()
  })

  it('should use a custom importName', () => {
    const { ast } = parse(file)

    expect(
      createGenerator({ importName: '@react-pdf/renderer' })(ast, 'style.elo')
    ).toMatchSnapshot()
  })
})
