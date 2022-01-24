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
  plugins: [
    ...baseConfig.plugins,
  ],
  devServer: {
    disableHostCheck: true,
    host: "0.0.0.0",
    public: "0.0.0.0:80",
    port: 80,
    historyApiFallback: true,
    watchContentBase: true,
  },
};
