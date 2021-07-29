const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const baseConfig = require("./webpack.base.config.js");

const environment =
  process.env.NODE_ENV == null ? "development" : process.env.NODE_ENV;
const useAnalyzer = environment.endsWith("analyze");

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
    ...(useAnalyzer
      ? [
          new BundleAnalyzerPlugin({
            analyzerPort: 80,
            analyzerHost: "0.0.0.0",
            openAnalyzer: false,
          }),
        ]
      : []),
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
