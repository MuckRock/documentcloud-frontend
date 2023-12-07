import type { Preview } from "@storybook/svelte";
import { initialize, mswLoader } from "msw-storybook-addon";
import { mockDateDecorator } from "storybook-mock-date-decorator";

import "../src/langs/i18n.js";
import "../src/style/variables.css";
import "../src/style/global.css";

// Initialize MSW
initialize({
  onUnhandledRequest: "bypass",
});

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
  // Provide the MSW addon loader globally
  loaders: [mswLoader],
};

export let decorators = [mockDateDecorator];

export default preview;
