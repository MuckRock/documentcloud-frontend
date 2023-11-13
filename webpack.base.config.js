import path from "node:path";
import url from "node:url";

import autoPreprocess from "svelte-preprocess";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import CircularDependencyPlugin from "circular-dependency-plugin";
import DotEnv from "dotenv-webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { sentryWebpackPlugin } from "@sentry/webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

import { preprocessOptions } from "./preprocess.config.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment = process.env.NODE_ENV || "development";

const useAnalyzer = environment.endsWith("analyze");

const prod =
  environment.startsWith("production") || environment.startsWith("staging");
const mode = prod ? "production" : "development";

const SENTRY_PROJECT =
  process.env.SENTRY_PROJECT || "documentcloud-frontend-staging";

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

export default wrap({
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte"),
      "@": path.resolve(__dirname, "src"),

      // these packages don't export correctly, so we use an alias to fix imports
      "axios-retry": path.resolve(
        __dirname,
        "node_modules/axios-retry/es/index.mjs",
      ),
      "marked-gfm-heading-id": path.resolve(
        __dirname,
        "node_modules/marked-gfm-heading-id/src/index.js",
      ),
      "magic-string": path.resolve(
        __dirname,
        "node_modules/magic-string/dist/magic-string.es.mjs",
      ),
      svue: path.resolve(__dirname, "node_modules/svue/dist/svue.js"),
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
    new DotEnv({
      path: prod ? `.env.${environment}` : ".env",
      defaults: ".env",
      systemvars: true,
    }),
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
    sentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "muckrock",
      project: SENTRY_PROJECT,
      telemetry: false,
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
  devtool: "source-map",
  stats: {
    orphanModules: true,
  },
});
