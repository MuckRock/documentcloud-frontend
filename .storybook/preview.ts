import type { Preview } from "@storybook/svelte";
import { initialize, mswLoader } from "msw-storybook-addon";
import { mockDateDecorator } from "storybook-mock-date-decorator";
import UserContextDecorator from "./decorators/UserContextDecorator.svelte";
import OrgContextDecorator from "./decorators/OrgContextDecorator.svelte";
import TipOfDayContextDecorator from "./decorators/TipOfDayContextDecorator.svelte";

import "@/style/kit.css";
import "@/lib/i18n/index.js";

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
    sveltekit_experimental: {
      stores: {
        page: {
          url: "/",
          data: {
            breadcrumbs: [],
          },
        },
      },
    },
  },
};

// Provide the MSW addon loader globally
export const loaders = [mswLoader];

export let decorators = [
  mockDateDecorator,
  () => UserContextDecorator,
  () => OrgContextDecorator,
  () => TipOfDayContextDecorator,
];

export default preview;
