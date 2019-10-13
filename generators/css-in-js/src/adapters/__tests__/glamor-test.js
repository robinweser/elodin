import { parse } from '@elodin/parser'

import { createGenerator } from '../../index'

import glamorAdapter from '../glamor'

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
  __border: 0
  backgroundColor: red
  paddingLeft: 10
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

  [@hover] {
    color: red
    fontSize: $fontSize
  }

  [@viewportWidth>=320] {
    color: green
    fontSize: $mediaFontSize
    [@hover] {
      fontSize: $mediaHoverFontSize
      color: blue
    }
  }
}`

describe('Compiling to CSS and JavaScript using glamor', () => {
  it('should return a map of files', () => {
    const { ast } = parse(file)

    expect(
      createGenerator({
        adapter: glamorAdapter(),
      })(ast, 'index.elo')
    ).toMatchSnapshot()
  })

  it('should pass adapter configuration', () => {
    const { ast } = parse(file)

    expect(
      createGenerator({
        adapter: glamorAdapter({ dynamicImport: true }),
      })(ast, 'index.elo')
    ).toMatchSnapshot()
  })
})
