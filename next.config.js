const withLess = require('@zeit/next-less')

module.exports = withLess({
  webpack(config) {
    // config.externals.push('ansi-regex')
    config.module.rules.push({
      test: /\.worker\.js$/,
      loader: 'worker-loader',
      options: {
        name: 'static/[hash].worker.js',
        publicPath: '/_next/',
      }
    })
    return config
  }
})