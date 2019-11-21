var createGenerator = require('@elodin/generator-fela').createGenerator

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
  generators: [
    createGenerator({
      devMode: process.env.NODE_ENV !== 'production',
      generateStyleName: styleName => styleName + 'Style',
      viewBaseClassName: '_v',
      textBaseClassName: '_t',
    }),
  ],
}
