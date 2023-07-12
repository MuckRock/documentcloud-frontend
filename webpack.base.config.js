const path = require("path");

const autoPreprocess = require("svelte-preprocess");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const DotEnv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const { preprocessOptions } = require("./preprocess.config.js");

const environment =
  process.env.NODE_ENV === null ? "development" : process.env.NODE_ENV;

const useAnalyzer = environment.endsWith("analyze");

const prod =
  environment.startsWith("production") || environment.startsWith("staging");
const mode = prod ? "production" : "development";

function wrap(spec) {
  if (mode === "production") {
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
  return spec;
}

module.exports = wrap({
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte"),
      "@": path.resolve(__dirname, "src"),
      "axios-retry": path.resolve(
        __dirname,
        "node_modules/axios-retry/es/index.mjs",
      ),
    },
    conditionNames: ["svelte", "browser"],
    extensions: [".mjs", ".js", ".ts", ".svelte", ".css", ".scss"],
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
            // hotReload: !prod,
            dev: !prod,
            preprocess: autoPreprocess(preprocessOptions),
            onwarn(warning, handler) {
              if (process.env.SUPPRESS_WARNINGS) return;

              handler(warning);
            },
          },
        },
      },
      {
        test: /\.s[ac]ss$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
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
      {
        /* reference https://github.com/baileyherbert/svelte-webpack-starter/blob/main/webpack.config.ts */
        test: /\.ts$/,
        loader: "ts-loader",
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
    new DotEnv(),
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
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve("src", "main.html"),
    }),
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
  devtool: prod ? false : "source-map",
});
