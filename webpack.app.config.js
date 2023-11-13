import path from "node:path";
import url from "node:url";

import baseConfig from "./webpack.base.config.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  ...baseConfig,
  entry: {
    bundle: ["./src/main.js"],
  },
  output: {
    path: __dirname + "/public",
    filename: "[name].[chunkhash].js",
    publicPath: "/",
  },
  plugins: [...baseConfig.plugins],
  devServer: {
    host: "0.0.0.0",
    port: 443,
    allowedHosts: "all",
    historyApiFallback: true,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true,
      },
      webSocketURL: "wss://www.dev.documentcloud.org:443/ws",
    },
  },
};

export default config;
