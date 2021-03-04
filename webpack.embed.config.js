const baseConfig = require('./webpack.base.config');

const targets = [
  ['./src/embed/enhance.js', '/public/embed', 'enhance.js'],
  ['./src/embed/noteLoader.js', '/public/notes', 'loader.js'],
  ['./src/embed/documentLoader.js', '/public/viewer', 'loader.js'],
  ['./src/embed/projectLoader.js', '/public/embed', 'loader.js'],
]

module.exports = targets.map(([src, outputPath, outputFilename]) => ({
  ...baseConfig,
  entry: {
    bundle: [src]
  },
  output: {
    path: __dirname + outputPath,
    filename: outputFilename,
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
}));
