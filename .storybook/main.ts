import autoPreprocess from 'svelte-preprocess';
import {preprocessOptions} from '../preprocess.config';

import type { StorybookConfig } from "@storybook/svelte-webpack5";
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx|svelte)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
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
  staticDirs: ['../public']
};
export default config;
