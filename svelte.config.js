const autoPreprocess = require("svelte-preprocess");
const { preprocessOptions } = require("./preprocess.config.js");

module.exports = {
  preprocess: autoPreprocess(preprocessOptions),
  onwarn: (warning, handler) => {
    const { code, frame } = warning;
    if (code === "css-unused-selector")
        return;

    handler(warning);
}
/* look in webpack.base.config.js for this functionality */
};
