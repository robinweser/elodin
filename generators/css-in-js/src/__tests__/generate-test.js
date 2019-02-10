import { parse } from '@elodin/parser'

import createGenerator from '../index'

const file = `
variant Type {
  Primary
  Secondary
}

variant Mode {
  Dark
  Light
}

style Button {
  backgroundColor: red
  color: rgba(250 250 250 0.35)
  fontSize: 15
  lineHeight: 5.2
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

style Label {
  lineHeight: $lineHeight
  fontSize: 20

  [@hover] {
    color: red
    backgroundColor: $bgColor
  }

  [@minWidth=320] {
    color: green
    backgroundColor: $mediaBgColor
    [@hover]{
      backgroundColor: $mediaHoverBgColor
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

    expect(createGenerator({ adapter: 'react-fela' })(ast)).toMatchSnapshot()
  })
})
