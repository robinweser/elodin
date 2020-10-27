var createGenerator = require('@elodin/generator-javascript').createGenerator

var replaceVariable = require('@elodin/plugin-replace-variable').default
var theme = require('./theme')

module.exports = {
  sources: ['components'],
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
  generator: createGenerator({
    devMode: process.env.ELODIN_ENV !== 'production',
    generateStyleName: (styleName) => styleName + 'Style',
    viewBaseClassName: '_v',
    textBaseClassName: '_t',
  }),
}
