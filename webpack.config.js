const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const autoPreprocess = require("svelte-preprocess");
const { preprocessOptions } = require("./preprocess.config.js");
const DotenvFlow = require("dotenv-flow-webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";

module.exports = {
  entry: {
    bundle: ["./src/main.js"]
  },
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte"),
      "@": path.resolve(__dirname, "src")
    },
    extensions: ["*", ".mjs", ".js", ".svelte", ".css", ".scss"],
    mainFields: ["svelte", "browser", "module", "main"]
  },
  output: {
    path: __dirname + "/public",
    filename: "[name].js",
    chunkFilename: "[name].[id].js"
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            emitCss: true,
            hotReload: true,
            preprocess: autoPreprocess(preprocessOptions)
          }
        }
      },
      {
        test: /\.s[ac]ss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: !prod }
          },
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: !prod }
          },
          "css-loader"
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-inline-loader",
            options: { removeSVGTagAttrs: false }
          }
        ]
      }
    ]
  },
  mode,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "bundle.css"
    }),
    new DotenvFlow()
    // ...(prod ? [new BundleAnalyzerPlugin({
    //   analyzerPort: 80,
    //   analyzerHost: '0.0.0.0',
    //   openAnalyzer: false
    // })] : [])
  ],
  devtool: prod ? false : "source-map",
  devServer: {
    disableHostCheck: true,
    host: "0.0.0.0",
    public: "0.0.0.0:80",
    port: 80,
    historyApiFallback: {
      index: "index.html"
    }
  }
};
