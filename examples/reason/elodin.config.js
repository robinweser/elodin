var createGenerator = require('@elodin/generator-reason').createGenerator

module.exports = {
  sources: ['components'],
  generator: createGenerator({
    devMode: process.env.NODE_ENV !== 'production',
    viewBaseClassName: '_v',
    textBaseClassName: '_t',
  }),
}
