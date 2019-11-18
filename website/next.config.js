var withCSS = require('@zeit/next-css')
var withMDX = require('@zeit/next-mdx')
var withTM = require('next-transpile-modules')
var bsconfig = require('./bsconfig.json')

const config = {
  experimental: {
    granularChunks: true,
  },
  serverless: false,
  extension: /\.(md|mdx)$/,
  pageExtensions: ['js', 'bs.js', 'md', 'mdx'],
  transpileModules: ['bs-platform'].concat(bsconfig['bs-dependencies']),
  webpack: config => {
    config.node = {
      fs: 'empty',
    }
    return config
  },
}

module.exports = withCSS(withMDX(withTM(config)))
