var generator = require('@elodin/generator-reason').createGenerator

module.exports = {
  generator: generator({
    devMode: false,
    rootNode: '#__next',
    generateResetClassName: type => '_' + type.substr(0, 1),
  }),
}
