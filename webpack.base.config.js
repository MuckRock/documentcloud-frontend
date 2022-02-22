const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const autoPreprocess = require("svelte-preprocess");
const { preprocessOptions } = require("./preprocess.config.js");
// import SvelteCheckPlugin from 'svelte-check-plugin';

const DotenvFlow = require("dotenv-flow-webpack");
const DotenvWebpack = require('dotenv-webpack');
const dotenv = require('dotenv');
const TerserPlugin = require("terser-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
// const CaseSensitivePaths = require('case-sensitive-paths-webpack-plugin');
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

// Speed measurer
const smp = new SpeedMeasurePlugin();

const environment =
  process.env.NODE_ENV == null ? "development" : process.env.NODE_ENV;

const useAnalyzer = environment.endsWith("analyze");

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
  } else {
    spec.optimization = {
      mangleExports: false,
      minimize: false
    }
  }
  return smp.wrap(spec);
}

console.warn("DocumentCloud: DUMPING ALL ENVIRONMENT VARS INTO FRONTEND")
dotenv.config();

module.exports = {
  optimization: {
    mangleExports: false,
    minimize: false,
    mergeDuplicateChunks: false,
    removeEmptyChunks: false,
    concatenateModules: false,
  },
  resolve: { /* https://webpack.js.org/configuration/resolve/#resolvefallback */
    alias: {
      svelte: path.resolve("node_modules", "svelte"),
      "@": path.resolve(__dirname, "src"),
    },
    extensions: ["*", ".mjs", ".js", /*".ts",*/ ".svelte", ".css", ".scss"],
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
            hotReload: prod,
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
            options: { hmr: prod },
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
            options: { hmr: prod },
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
      // { /* reference https://github.com/baileyherbert/svelte-webpack-starter/blob/main/webpack.config.ts */
      //   test: /\.ts$/,
      //   loader: 'ts-loader',
      //   exclude: /node_modules/
      // },
    ],
  },
  mode,
  performance: {
    hints: prod ? "warning" : false,
  },
  plugins: [
    // new CaseSensitivePaths(),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new DotenvFlow(),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env)
  }),
    // new DotenvWebpack({
    //         path: '/app/.env',
    //         systemvars: true, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
    //         prefix: 'process.env.'
    //       }),
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
      // templateParameters(compilation, assets, options) {
      //   return {
      //     compilation,
      //     webpack: compilation.getStats().toJson(),
      //     webpackConfig: compilation.options,
      //     htmlWebpackPlugin: {
      //       files: assets,
      //       options,
      //     },
      //     process,
      //   }
      // },
    }),
    ...(useAnalyzer
      ? [
        new BundleAnalyzerPlugin({
          analyzerPort: 80,
          analyzerHost: "0.0.0.0",
          openAnalyzer: false,
        }),
      ]
      : [])
  ],
  devtool: prod ? false : "source-map",
};
