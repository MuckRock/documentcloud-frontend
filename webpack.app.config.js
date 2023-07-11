const baseConfig = require("./webpack.base.config.js");

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
  plugins: [...baseConfig.plugins],
  devServer: {
    // disableHostCheck: true,
    host: "0.0.0.0",
    port: 443,
    allowedHosts: "all",
    // public: "0.0.0.0:443",
    port: 80,
    historyApiFallback: true,
    hot: false,
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
      webSocketURL: "wss://www.dev.documentcloud.org:443/ws",
    },
    // watchContentBase: true,
  },
};
