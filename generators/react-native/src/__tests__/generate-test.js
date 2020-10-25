import { parse } from '@elodin/parser'

import { createGenerator } from '../index'

const file = `
style Button {
  backgroundColor: red
  paddingLeft: 10
  alignItems: $alignItems
}

style Box {
  paddingTop: 10
}

style Label {
  lineHeight: $lineHeight
  fontSize: 12
}`

describe('Compiling to React Native', () => {
  it('should return a map of files', () => {
    const { ast } = parse(file)

    expect(createGenerator()(ast, 'style.elo')).toMatchSnapshot()
  })

  it('should use a custom importName', () => {
    const { ast } = parse(file)

    expect(
      createGenerator({ importFrom: '@react-pdf/renderer' })(ast, 'style.elo')
    ).toMatchSnapshot()
  })
})
