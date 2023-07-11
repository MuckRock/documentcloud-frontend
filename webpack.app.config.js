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
    host: "0.0.0.0",
    port: 443,
    allowedHosts: "all",
    port: 80,
    historyApiFallback: true,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
      webSocketURL: "wss://www.dev.documentcloud.org:443/ws",
    },
  },
};
