import path from "node:path";
import autoPreprocess from "svelte-preprocess";
import { preprocessOptions } from "../preprocess.config.js";

import type { StorybookConfig } from "@storybook/svelte-webpack5";

const config: StorybookConfig = {
  core: {
    disableTelemetry: true, // 👈 Disables telemetry
  },
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|svelte)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-svelte-csf",
  ],
  framework: {
    name: "@storybook/svelte-webpack5",
    options: {
      preprocess: autoPreprocess(preprocessOptions),
    },
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../public"],
  typescript: {
    check: false,
    checkOptions: {},
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve(__dirname, "../src"),
      };
    }

    config.devtool = "source-map";

    return config;
  },
};

export default config;
