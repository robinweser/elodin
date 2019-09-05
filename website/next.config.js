var withCSS = require('@zeit/next-css')
var withMDX = require('@zeit/next-mdx')
var withTM = require('next-transpile-modules')

module.exports = withCSS(
  withMDX({
    extension: /\.(md|mdx)$/,
  })(
    withTM({
      pageExtensions: ['js', 'bs.js'],
      transpileModules: ['bs-platform', 'reason-react', '@tavata/ui'],
    })
  )
)
