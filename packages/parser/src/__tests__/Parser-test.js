import Parser from '../Parser'

describe('Parsing elodin syntax', () => {
  it.only('should correctly parse styles', () => {
    const file = `
view Button {
  backgroundColor: red
  borderColor: rgba(255 255 255 percentage(add(20 10)))
  paddingLeft: 15
  marginTop: 1.2
  borderWidth: $width
  __animationName: keyframe
}`

    const parser = new Parser()

    expect(parser.parse(file).errors.length).toBe(0)
    expect(parser.parse(file).ast).toMatchSnapshot()
  })

  it('should correctly parse multiple styles', () => {
    const file = `
view Button {
  backgroundColor: red
  paddingLeft: 10
}

text Label {
  lineHeight: 2
}`

    const parser = new Parser()

    expect(parser.parse(file).errors.length).toBe(0)
    expect(parser.parse(file).ast).toMatchSnapshot()
  })

  it('should correctly parse conditionals', () => {
    const file = `
    variant Mode {
      Dark
      Light
    }

view Button {
  backgroundColor: red

  [Mode=Dark] {
    backgroundColor: blue
  }
}`

    const parser = new Parser()

    expect(parser.parse(file).errors.length).toBe(0)
    expect(parser.parse(file).ast).toMatchSnapshot()
  })

  it('should correctly parse comments', () => {
    const file = `
    # variant comment
    variant Foo {
      Bar
      # baz
      Foo
    }
    # A comment
    # Another one
view Button {
  backgroundColor: red # inline
  borderColor: rgb(255 255 255)
  paddingLeft: 15
  marginTop: 1.2
  borderWidth: $width
  # another
  __animationName: keyframe
}`

    const parser = new Parser()

    expect(parser.parse(file).errors.length).toBe(0)
    expect(parser.parse(file).ast).toMatchSnapshot()
  })

  it('should correctly parse fragments', () => {
    const file = `
fragment Flex {
  flexDirection: row
  alignSelf: stretch
  flexGrow: 0
  flexShrink: 1
  flexBasis: 50
}`

    const parser = new Parser()

    expect(parser.parse(file).errors.length).toBe(0)
    expect(parser.parse(file).ast).toMatchSnapshot()
  })

  it('should correctly parse env condition', () => {
    const file = `
view Button {
  [@hover] {
    backgroundColor: red
  }

  [@viewportWidth>=320] {
    backgroundColor: blue
    [@hover] {
      backgroundColor: green
    }
  }
}`

    const parser = new Parser()

    expect(parser.parse(file).errors.length).toBe(0)
    expect(parser.parse(file).ast).toMatchSnapshot()
  })
})
