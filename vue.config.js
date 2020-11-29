const path = require('path')

module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
        '~': path.resolve(__dirname, 'src/'),
      },
    },
  },
  devServer: {
    disableHostCheck: true,
    proxy: {
      '^/ws': {
        target: 'ws://192.168.1.20:3000/',
        ws: true,
      },
      '^/api': {
        target: 'http://192.168.1.20:3000/',
      },
    },
  },
}
