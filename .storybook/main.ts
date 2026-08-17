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
    { name: "@storybook/addon-svelte-csf" },
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],

  framework: {
    name: "@storybook/sveltekit",
    options: {},
  },

  refs: {
    "chromatic-published-storybook": {
      title: "Storybook",
      // Permalink for our main branch
      url: "https://main--6567908438a7a23eba571d04.chromatic.com",
    },
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
