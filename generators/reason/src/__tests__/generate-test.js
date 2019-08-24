import { parse } from '@elodin/parser'

import createGenerator from '../createGenerator'

const file = `
variant Variant {
  Primary
  Secondary
}

variant Mode {
  Dark
  Light
  Semi
}

view Button {
  backgroundColor: red
  paddingLeft: 10
  paddingBottom: 10
  paddingTop: $top
  [@viewportWidth>=100] {
    paddingRight: $paddingMedia
  }
  [Variant=Primary] {
    backgroundColor: blue
  }
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
