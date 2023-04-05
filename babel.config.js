module.exports = {
  sourceType: "unambiguous",
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
          chrome: 100
        },
      },
    ],
    "@babel/preset-typescript"
  ],
  plugins: []
};
