var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var webpack = require('webpack')

module.exports = {
  outputDir: path.resolve(__dirname, './dist'),
  css: { extract: false },
  chainWebpack: config => {
    config.optimization.delete('splitChunks')
  }
}

if (process.env.NODE_ENV === 'production') {
  Object.assign(module.exports, {
    configureWebpack: config => {
      config.entry = './src/index.js'
      config.plugins = (config.plugins || []).concat([
        new webpack.DefinePlugin({ 'process.env': { NODE_ENV: '"production"' } })
      ])
      config.output = Object.assign(config.output || {}, {
        libraryExport: 'default',
        filename: 'vue-edi-table.js'
      })
    }
  })
} else if (process.env.NODE_ENV === 'development') {
  Object.assign(module.exports, {
    outputDir: path.resolve(__dirname, './docs'),
    baseUrl: '/vue-edi-table',
    configureWebpack: config => {
      config.entry = './src/demo/main.js'
      config.plugins = (config.plugins || []).concat([
        new HtmlWebpackPlugin({ filename: 'index.html', template: 'src/demo/index.html' })
      ])
    }
  })
}
