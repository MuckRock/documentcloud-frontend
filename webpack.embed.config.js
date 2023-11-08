import path from "node:path";
import url from "node:url";

import baseConfig from "./webpack.base.config.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targets = [
  ["./src/embed/enhance.js", "/public/embed", "enhance.js"] /* page embeds */,
  ["./src/embed/noteLoader.js", "/public/notes", "loader.js"] /* node embed */,
  [
    "./src/embed/documentLoader.js",
    "/public/viewer",
    "loader.js",
  ] /* document embed */,
  [
    "./src/embed/projectLoader.js",
    "/public/embed",
    "loader.js",
  ] /* was search embed, but now only project embeds */,
];

const configs = targets.map(([src, outputPath, outputFilename]) => ({
  ...baseConfig,
  entry: {
    bundle: [src],
  },
  output: {
    path: __dirname + outputPath,
    filename: outputFilename,
    publicPath: "/",
  },
  module: {
    ...baseConfig.module,
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            ...baseConfig.module.rules[0].use.options,
            emitCss: false,
          },
        },
      },
      ...baseConfig.module.rules.slice(1),
    ],
  },
  watch: baseConfig.mode !== "production",
}));

export default configs;
