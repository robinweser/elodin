import { parse } from '@elodin/parser'

import { createGenerator } from '../index'

const file = `
variant Type {
  Primary
  Secondary
}

variant Mode {
  Dark
  Light
}

view Button {
  backgroundColor: red
  paddingLeft: 10
  __borderWidth: multiply($borderWidth 2)
  [Type=Primary] {
    color: red
    [Mode=Dark] {
      color: blue
    }
  }
  [Mode=Light] {
    color: green
  }
}

text Label {
  lineHeight: $lineHeight

  [@hover] {
    color: red
    fontSize: $fontSize
  }

  [@minWidth=320] {
    color: green
    fontSize: $mediaFontSize
    [@hover]{
      fontSize: $mediaHoverFontSize
      color: blue
    }
  }
}`

describe('Compiling to CSS and JavaScript', () => {
  it('should return a map of files', () => {
    const { ast } = parse(file)

    expect(createGenerator()(ast)).toMatchSnapshot()
  })

  it('should use the given adapter', () => {
    const { ast } = parse(file)

    expect(
      createGenerator({ adapter: 'react-fela' })(ast, 'root')
    ).toMatchSnapshot()
  })
})
