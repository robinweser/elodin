var withCSS = require('@zeit/next-css')
var withMDX = require('@zeit/next-mdx')
var withTM = require('next-transpile-modules')
var bsconfig = require('./bsconfig.json')

module.exports = withCSS(
  withMDX({
    extension: /\.(md|mdx)$/,
  })(
    withTM({
      serverless: false,
      pageExtensions: ['js', 'bs.js', 'md', 'mdx'],
      transpileModules: ['bs-platform'].concat(bsconfig['bs-dependencies']),
      webpack: config => {
        config.node = {
          fs: 'empty',
        }
        return config
      },
    })
  )
)
