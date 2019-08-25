import capitalizeString from '../capitalizeString'

describe('Capitalizing a string', () => {
  it('should return a capitalized string', () => {
    expect(capitalizeString('paddingLeft')).toBe('PaddingLeft')
  })
})
