var generator = require('@elodin/generator-css-in-js').createGenerator
var felaAdapter = require('@elodin/generator-css-in-js/lib/adapters/fela')
  .default

var replaceVariable = require('@elodin/plugin-replace-variable').default
var theme = require('./theme')

module.exports = {
  plugins: [
    replaceVariable({
      variables: {
        theme,
      },
      selector: (vars, prop) =>
        prop
          .split('_')
          .reduce((out, sub) => (out ? out[sub] : undefined), vars),
    }),
  ],
  generator: generator({
    adapter: felaAdapter,
    rootNode: '#__next',
    generateResetClassName: type => '_' + type.charAt(0),
  }),
}
