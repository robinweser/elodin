var webpack = require('webpack')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
var withMDX = require('@zeit/next-mdx')
var withCSS = require('@zeit/next-css')
var withOffline = require('next-offline')
var withTM = require('next-transpile-modules')
var bsconfig = require('./bsconfig.json')
var withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const config = {
  experimental: {
    granularChunks: true,
  },
  serverless: true,
  pageExtensions: ['js', 'bs.js', 'mdx', 'md'],
  workboxOpts: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'cacheFirst',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      { urlPattern: /^https?.*/, handler: 'networkFirst' },
    ],
    // Not sure adding display swap is actually working (i see fetch for plain still after)
    // importScripts: ['static/js/service-worker-extras.js'],
    skipWaiting: true,
    clientsClaim: true,
  },
  transpileModules: ['bs-platform'].concat(bsconfig['bs-dependencies']),
}

module.exports = withBundleAnalyzer(
  withOffline(
    withMDX({ extension: /\.(md|mdx)$/ })(
      withCSS(
        withTM({
          ...config,

          webpack(config, options) {
            if (config.mode === 'production') {
              if (Array.isArray(config.optimization.minimizer)) {
                config.optimization.minimizer.push(
                  new OptimizeCSSAssetsPlugin({})
                )
              }
            }

            return config
          },
        })
      )
    )
  )
)
