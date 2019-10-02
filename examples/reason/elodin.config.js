var generator = require('@elodin/generator-reason').createGenerator

module.exports = {
  generator: generator({
    rootNode: '#__next',
    generateResetClassName: type => '__' + type.substr(0, 1),
  }),
}
