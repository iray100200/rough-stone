const withCSS = require('@zeit/next-css')
const withLess = require('@zeit/next-less')

module.exports = withLess({
  ...withCSS({
    cssLoaderOptions: {
      url: false
    },
    webpack(config) {
      config.module.rules.push({
        test: /\.worker\.js$/,
        loader: 'worker-loader',
        options: {
          name: 'static/[hash].worker.js',
          publicPath: '/_next/',
        },
      })
      return config
    }
  })
})