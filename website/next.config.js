var withCSS = require('@zeit/next-css')
var withMDX = require('@zeit/next-mdx')
var withTM = require('next-transpile-modules')

module.exports = withCSS(
  withMDX({
    extension: /\.(md|mdx)$/,
  })(
    withTM({
      pageExtensions: ['js', 'bs.js', 'md', 'mdx'],
      transpileModules: ['bs-platform', 'reason-react', '@tavata/ui'],
      webpack: config => {
        config.node = {
          fs: 'empty',
        }
        return config
      },
    })
  )
)
