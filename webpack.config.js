const appConfig = require("./webpack.app.config.js");
const embedConfig = require("./webpack.embed.config.js");

module.exports = [appConfig, ...embedConfig];
