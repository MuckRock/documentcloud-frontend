/* TODO: switch to imports instead of require https://github.com/baileyherbert/svelte-webpack-starter/blob/main/webpack.config.ts */
const path = require("path");
const autoPreprocess = require("svelte-preprocess");
const { preprocessOptions } = require("./preprocess.config.js");
const SvelteCheckPlugin = require('svelte-check-plugin');

const DotenvWebpack = require('dotenv-webpack');
const dotenv = require('dotenv');

/*known conflict SMR + MiniCSS: https://github.com/stephencookdev/speed-measure-webpack-plugin/issues/149#issuecomment-833464523 */
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const TerserPlugin = require("terser-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
// const CaseSensitivePaths = require('case-sensitive-paths-webpack-plugin');
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

// Speed measurer
const smp = new SpeedMeasurePlugin();


const environment =
  process.env.NODE_ENV == null ? "development" : process.env.NODE_ENV;

/**
 * Change this to `true` to run svelte-check during hot reloads. This will impact build speeds but will show more
 * thorough errors and warnings.
 */
 const svelteCheckInDevelopment = false;

 /**
 * Change this to `false` to disable svelte-check during production builds. Build speeds will be faster, but error
 * and warning checks will be less thorough.
 */
const svelteCheckInProduction = true;


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

module.exports = wrap({
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
            hotReload: false, /* Turned off for newer versions */
            hotOptions: { /* 
              TK none of these alternated, non-default settings seem fix the
               underlying problem with Svue 
              https://github.com/sveltejs/svelte-hmr 
              https://github.com/sveltejs/svelte-hmr/blob/809c7016803c8f90819a6ff3fa2a217c13ea87e9/lib/make-hot.js
              */
              // Prevent preserving local component state
              preserveLocalState: true,

              // If this string appears anywhere in your component's code, then local
              // state won't be preserved, even when noPreserveState is false
              noPreserveStateKey: '@hmr:reset',
              preserveAllLocalStateKey: '@hmr:keep-all',

              // Prevent doing a full reload on next HMR update after fatal error
              noReload: true,

              // Try to recover after runtime errors in component init
              optimistic: false,

              // --- Advanced ---

              // Prevent adding an HMR accept handler to components with
              // accessors option to true, or to components with named exports
              // (from <script context="module">). This have the effect of
              // recreating the consumer of those components, instead of the
              // component themselves, on HMR updates. This might be needed to
              // reflect changes to accessors / named exports in the parents,
              // depending on how you use them.
              acceptAccessors: false,
              acceptNamedExports: false,
            },
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
    // new DotenvFlow(),
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
    ...(svelteCheckInDevelopment || prod && svelteCheckInProduction ? [new SvelteCheckPlugin()] : [])
    ,
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
  devtool: prod ? false : "inline-source-map", /* try pathinfo https://stackoverflow.com/questions/32296967/webpack-dev-server-doesnt-generate-source-maps or https://webpack.js.org/plugins/source-map-dev-tool-plugin/ w publicPath + Exclude Vendor Maps node_modules */
});
