import type { StorybookConfig } from "@storybook/svelte-vite";

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
    name: "@storybook/sveltekit",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
