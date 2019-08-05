var generator = require('@elodin/generator-css-in-js').createGenerator

module.exports = {
  generator: generator({
    adapter: 'fela',
    devMode: true,
  }),
}
