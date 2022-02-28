const autoPreprocess = require("svelte-preprocess");
const { preprocessOptions } = require("./preprocess.config.js");

module.exports = {
  preprocess: autoPreprocess(preprocessOptions),
  onwarn: (warning, handler) => { /* see also ignoreWarning in base webpack https://github.com/sveltejs/svelte-loader/pull/96#issuecomment-887691760 */
    const { code, frame } = warning;
    if (code === "css-unused-selector")
        return;

    handler(warning);
}
/* look in webpack.base.config.js for this functionality */
};