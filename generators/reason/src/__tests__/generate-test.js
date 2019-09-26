import { parse } from '@elodin/core'

import createGenerator from '../createGenerator'

const file = `
variant Size {
  Small
  Big
}

variant Type {
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
  __border: 0
  borderWidth: $borderWidth
  [Type=Primary] {
    backgroundColor: red
    paddingLeft: $paddingLeft

    [@hover] {
      paddingLeft: 10
      paddingRight: $paddingRight
    }
    [Mode=Dark] {
      backgroundColor: blue
      paddingLeft: $padLeft
    }
  }

  [Mode=Light] {
    backgroundColor: green
  }
}

text Label {
  lineHeight: $lineHeight

  [Size=Small] {
    fontSize: 15
  }

  [@hover] {
    color: red
    fontSize: $fontSize
  }

  [Mode=Light] {
    fontSize: 16
  }

  [@viewportWidth=320] {
    color: green
    fontSize: $mediaFontSize
    [@hover] {
      fontSize: $mediaHoverFontSize
      color: blue
    }
  }
}`

describe('Compiling to ReasonML', () => {
  it('should return a map of files', () => {
    const { ast } = parse(file)

    expect(createGenerator()(ast, 'root.elo')).toMatchSnapshot()
  })

  it('should return a map of files in devMode', () => {
    const { ast } = parse(file)

    expect(
      createGenerator({ devMode: true })(ast, 'root.elo')
    ).toMatchSnapshot()
  })
})
