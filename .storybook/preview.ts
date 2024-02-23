import type { Preview } from "@storybook/svelte";
import { initialize, mswLoader } from "msw-storybook-addon";
import { mockDateDecorator } from "storybook-mock-date-decorator";

import "@/style/kit.css";
import "../src/lib/i18n/index.js";

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
    cookie: {
      csrftoken: "mockToken",
    },
    cookiePreserve: true,
  },
};

// Provide the MSW addon loader globally
export const loaders = [mswLoader];

export let decorators = [mockDateDecorator];

export default preview;
