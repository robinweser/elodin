var generator = require('@elodin/generator-css-in-js').createGenerator
var felaAdapter = require('@elodin/generator-css-in-js/lib/adapters/fela')
  .default

module.exports = {
  generator: generator({
    adapter: felaAdapter,
    rootNode: '#__next',
    generateResetClassName: type => '_' + type.charAt(0),
  }),
}
