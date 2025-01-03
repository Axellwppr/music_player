const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: [
      'vuetify'
    ],

    pages: {
      index: 'src/main.js',
      proxy: {
          entry: 'src/pages/proxy.js'
      },
      list: {
        entry: 'src/pages/list.js'
    }
  },

    pluginOptions: {
        electronBuilder: {
            preload: 'src/preload.js',
        },
    },

    lintOnSave: false
})