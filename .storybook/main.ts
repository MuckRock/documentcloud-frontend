import type { StorybookConfig } from "@storybook/svelte-vite";

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
    "@storybook/addon-svelte-csf",
    "storybook-addon-cookie",
  ],
  framework: {
    name: "@storybook/sveltekit",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },

  viteFinal(config) {
    config.resolve = {
      alias: {
        "@": new URL("../src", import.meta.url).toString(),
        "@/*": new URL("../src/*", import.meta.url).toString(),
      },
    };

    config.build = {
      ...config.build,
      target: "esnext",
    };

    return config;
  },
};

export default config;
