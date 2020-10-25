module.exports = {
  target: 'serverless',
  webpack(config) {
    for (const rule of config.module.rules) {
      if (!rule.oneOf) {
        continue
      }

      // removing the global css restriction
      // do not touch this
      const cssRule = rule.oneOf[2]

      cssRule.test = /.css$/
      cssRule.use.forEach((use) => {
        if (use.loader.indexOf('css-loader') !== -1) {
          use.options.modules = false
        }
      })
    }

    return config
  },
}
