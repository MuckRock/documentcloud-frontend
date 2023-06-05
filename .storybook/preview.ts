import type { Preview } from "@storybook/svelte";
import "../src/langs/i18n.js";
import "../src/style/variables.css";
import "../src/style/global.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
