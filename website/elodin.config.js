var { createGenerator } = require('@elodin/generator-reason')

module.exports = {
  generator: createGenerator({
    devMode: false,
    rootNode: '#__next',
    generateResetClassName: type => '_' + type.substr(0, 1),
    // dynamicImport: true,
  }),
}
