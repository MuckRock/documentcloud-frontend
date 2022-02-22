const baseConfig = require("./webpack.base.config.js");
const path = require('path');

module.exports = {
  ...baseConfig,
  entry: {
    bundle: ["./src/main.js"],
  },
  output: {
    path: __dirname + "/public",
    filename: "[name].[chunkhash].js",
    publicPath: "/",
  },
  plugins: [
    ...baseConfig.plugins,
  ],
  devServer: {
    /* 
    Dylan had this on v3
    https://github.com/webpack/webpack-dev-server/blob/master/migration-v4.md
    */
    allowedHosts: 'all',
    host: "0.0.0.0",
    port: 80,
    historyApiFallback: true,
    client: {
      // logging: "warnings",
      // Can be used only for `errors`/`warnings`
      //
      // overlay: {
      //   errors: true,
      //   warnings: true,
      // }
      overlay: true,
      // progress: true,
    },
    static: {
      directory: path.join(__dirname, 'public'),
      staticOptions: {},
      // Don't be confused with `devMiddleware.publicPath`, it is `publicPath` for static directory
      // Can be:
      // publicPath: ['/static-public-path-one/', '/static-public-path-two/'],
      publicPath: '/',
      // Can be:
      // serveIndex: {} (options for the `serveIndex` option you can find https://github.com/expressjs/serve-index)
      serveIndex: true,
      // Can be:
      // watch: {} (options for the `watch` option you can find https://github.com/paulmillr/chokidar)
      watch: true,
    },

  },
};
