import { parse } from '@elodin/parser'

import createGenerator from '../index'

const file = `
style Button {
  backgroundColor: red
  color: rgba(250 250 250 0.35)
  fontSize: 15
  lineHeight: 5.2
}

style Label {
  lineHeight: $lineHeight
  padding: 20

  [@hover] {
    color: red
    borderColor: $hoverBorder
  }

  [@minWidth=320] {
    color: green
    borderColor: $mediaBorder
    [@hover]{
      borderColor: $mediaHoverBorder
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

    expect(createGenerator('react-fela')(ast)).toMatchSnapshot()
  })
})
