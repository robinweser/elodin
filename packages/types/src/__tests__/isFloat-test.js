import isFloat from '../validators/isFloat'

describe('Validating Float ast nodes', () => {
  it('should correctly validate', () => {
    expect(isFloat({ type: 'Float', fractional: 1, integer: 2 })).toBe(true)
    expect(isFloat({ type: 'NumericLiteral', value: 23 })).toBe(false)
  })
})
