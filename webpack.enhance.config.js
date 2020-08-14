const baseConfig = require('./webpack.base.config');

module.exports = {
  ...baseConfig,
  entry: {
    bundle: ["./src/enhance.js"]
  },
  output: {
    path: __dirname + "/public/embed",
    filename: "enhance.js",
    publicPath: "/"
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
            emitCss: false
          }
        }
      },
      ...baseConfig.module.rules.slice(1)
    ]
  },
  watch: baseConfig.mode != 'production',
};
