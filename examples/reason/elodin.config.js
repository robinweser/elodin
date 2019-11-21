var createGenerator = require('@elodin/generator-reason-fela').createGenerator

module.exports = {
  sources: ['components'],
  generators: [
    createGenerator({
      devMode: process.env.NODE_ENV !== 'production',
      viewBaseClassName: '_v',
      textBaseClassName: '_t',
    }),
  ],
}
