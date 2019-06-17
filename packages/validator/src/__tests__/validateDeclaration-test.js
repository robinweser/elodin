import { validateDeclaration } from '..'

describe('Validating declarations', () => {
  it('should correctly validate', () => {
    expect(
      validateDeclaration(
        'flexDirection',
        {
          type: 'Identifier',
          value: 'column',
        },
        'column',
        'view'
      )
    ).toBe(true)
    expect(
      validateDeclaration(
        'flexGrow',
        { type: 'Integer', value: 12 },
        12,
        'view'
      )
    ).toBe(true)
    expect(
      validateDeclaration(
        'flexDirection',
        {
          type: 'Identifier',
          value: 'left',
        },
        'left',
        'view'
      )
    ).not.toBe(true)
    expect(
      validateDeclaration(
        'display',
        { type: 'Identifier', value: 'table' },
        'table',
        'view'
      )
    ).not.toBe(true)
  })
})
