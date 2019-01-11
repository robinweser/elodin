import { validateDeclaration } from '..'

describe('Validating declarations', () => {
  it('should correctly validate', () => {
    expect(
      validateDeclaration('flexDirection', {
        type: 'Identifier',
        value: 'column',
      })
    ).toBe(true)
    expect(
      validateDeclaration('flexGrow', { type: 'NumericLiteral', value: 12 })
    ).toBe(true)
    expect(
      validateDeclaration('flexDirection', {
        type: 'Identifier',
        value: 'left',
      })
    ).toBe(false)
    expect(
      validateDeclaration('display', { type: 'Identifier', value: 'table' })
    ).toBe(false)
  })
})
