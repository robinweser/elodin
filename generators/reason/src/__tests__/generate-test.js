import { parse } from '@elodin/parser'

import createGenerator from '../createGenerator'

const file = `
view Button {
  backgroundColor: red
  paddingLeft: 10
  paddingBottom: 10
  paddingTop: $top
}

text ButtonText {
  fontSize: $size
  fontWeight: $weight
  lineHeight: 1.3
  fontFamily: "Arial"
}`

describe('Compiling to ReasonML', () => {
  it('should return a map of files', () => {
    const { ast } = parse(file)

    expect(createGenerator()(ast, 'root.elo')).toMatchSnapshot()
  })
})
