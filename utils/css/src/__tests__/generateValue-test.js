import generateValue from '../generateValue'

const rgb = (r, g, b) => ({
  type: 'FunctionExpression',
  callee: 'rgb',
  params: [
    {
      type: 'Integer',
      value: r,
    },
    {
      type: 'Integer',
      value: g,
    },
    {
      type: 'Integer',
      value: b,
    },
  ],
})

const add = (a, b) => ({
  type: 'FunctionExpression',
  callee: 'add',
  params: [
    {
      type: 'Integer',
      value: a,
    },
    {
      type: 'Integer',
      value: b,
    },
  ],
})

const percentage = value => ({
  type: 'FunctionExpression',
  callee: 'percentage',
  params: [{ type: 'Integer', value }],
})

describe('Generating CSS values', () => {
  it('should hyphenate values', () => {
    expect(
      generateValue(
        {
          type: 'Identifier',
          value: 'flexStart',
        },
        'alignSelf'
      )
    ).toBe('flex-start')
  })

  it('should add units', () => {
    expect(
      generateValue(
        {
          type: 'Integer',
          value: 50,
        },
        'width',
        true
      )
    ).toBe('50px')
  })

  it('should resolve variables', () => {
    expect(
      generateValue(
        {
          type: 'Variable',
          value: 'themeBackgroundColor',
        },
        'backgroundColor',
        true
      )
    ).toBe('var(--theme-background-color)')
  })

  it('should resolve functions', () => {
    expect(
      generateValue(
        {
          type: 'FunctionExpression',
          callee: 'fade',
          params: [rgb(250, 0, 250), percentage(50)],
        },
        'color'
      )
    ).toBe('rgba(250, 0, 250, 0.5)')
  })
})
