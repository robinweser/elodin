var withMDX = require('@zeit/next-mdx')
var withCSS = require('@zeit/next-css')

module.exports = withCSS(
  withMDX({
    extension: /\.(md|mdx)$/,
  })({
    pageExtensions: ['js', 'mdx'],
    target: 'serverless',
  })
)
