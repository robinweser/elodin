var withCSS = require('@zeit/next-css')
var withTM = require('next-transpile-modules')
var bsconfig = require('./bsconfig.json')

const config = {
  pageExtensions: ['js', 'bs.js'],
  transpileModules: ['bs-platform'].concat(bsconfig['bs-dependencies']),
}

module.exports = withCSS(withTM(config))
