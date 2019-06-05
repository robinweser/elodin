var generator = require('@elodin/generator-css-in-js').default

module.exports = {
  generator: generator({
    adapter: 'react-fela',
  }),
  errors: 'throw',
  plugins: [],
}
