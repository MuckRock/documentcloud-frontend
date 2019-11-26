module.exports = {
  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    public: '0.0.0.0:80',
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/scss/variables.scss";
        `
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-svg-inline-loader')
      .loader('vue-svg-inline-loader');
  },
};
