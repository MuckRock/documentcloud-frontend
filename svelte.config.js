const autoPreprocess = require("svelte-preprocess");
const { preprocessOptions } = require("./preprocess.config.js");

module.exports = {
  preprocess: autoPreprocess(preprocessOptions),
};
