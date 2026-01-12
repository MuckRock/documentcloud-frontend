import type { StorybookConfig } from "@storybook/sveltekit";

const config: StorybookConfig = {
  core: {
    disableTelemetry: true, // 👈 Disables telemetry
  },
  stories: [
    "../src/lib/**/*.stories.@(js|jsx|ts|tsx|svelte)",
    "../src/routes/**/*.stories.@(js|jsx|ts|tsx|svelte)",
  ],
  staticDirs: ["../public", "../static"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-cookie",
    { name: "@storybook/addon-svelte-csf", options: { legacyTemplate: true } },
  ],
  framework: {
    name: "@storybook/sveltekit",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },

  async viteFinal(config) {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": new URL("../src", import.meta.url).pathname,
        "@/*": new URL("../src/*", import.meta.url).pathname,
      };
    }

    if (config.build) {
      config.build.target = "esnext";
    }

    return config;
  },
};

export default config;
