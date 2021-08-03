const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const autoPreprocess = require("svelte-preprocess");
const { preprocessOptions } = require("./preprocess.config.js");
const DotenvFlow = require("dotenv-flow-webpack");
const TerserPlugin = require("terser-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

// Speed measurer
const smp = new SpeedMeasurePlugin();

const environment =
  process.env.NODE_ENV == null ? "development" : process.env.NODE_ENV;
const prod =
  environment.startsWith("production") || environment.startsWith("staging");
const mode = prod ? "production" : "development";

function wrap(spec) {
  if (mode == "production") {
    spec.optimization = {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            mangle: false,
          },
        }),
      ],
    };
    return spec;
  }
  return smp.wrap(spec);
}

module.exports = wrap({
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte"),
      "@": path.resolve(__dirname, "src"),
    },
    extensions: ["*", ".mjs", ".js", ".svelte", ".css", ".scss"],
    mainFields: ["svelte", "browser", "module", "main"],
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            emitCss: prod,
            hotReload: !prod,
            preprocess: autoPreprocess(preprocessOptions),
          },
        },
      },
      {
        test: /\.s[ac]ss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: !prod },
          },
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: !prod },
          },
          "css-loader",
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-inline-loader",
            options: { removeSVGTagAttrs: false },
          },
        ],
      },
    ],
  },
  mode,
  performance: {
    hints: prod ? "warning" : false,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new DotenvFlow(),
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /node_modules/,
      // include specific files based on a RegExp
      include: /src/,
      // add errors to webpack instead of warnings
      failOnError: true,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    }),
  ],
  devtool: prod ? false : "source-map",
});
