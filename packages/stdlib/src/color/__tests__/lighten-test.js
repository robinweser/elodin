import lighten from '../lighten'

describe('Lightening a color', () => {
  it('should return a string with the input format', () => {
    expect(lighten('rgb(100, 100, 100)', 0.5, 'rgb')).toMatchSnapshot()
    expect(lighten('rgba(100, 100, 100, 0.5)', 0.5, 'rgb')).toMatchSnapshot()
  })
})
