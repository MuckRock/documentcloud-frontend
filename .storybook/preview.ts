import type { Preview } from "@storybook/svelte";

import "@/style/kit.css";
import "$lib/i18n/index.js";

import { initialize, mswLoader } from "msw-storybook-addon";
import UserContextDecorator from "./decorators/UserContextDecorator.svelte";
import OrgContextDecorator from "./decorators/OrgContextDecorator.svelte";
import TipOfDayContextDecorator from "./decorators/TipOfDayContextDecorator.svelte";
import ViewerContextDecorator from "./decorators/ViewerContextDecorator.svelte";

// Initialize MSW (v2 API)
initialize({
  onUnhandledRequest: "bypass",
  serviceWorker: {
    url: "./mockServiceWorker.js",
  },
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
          url: new URL("https://www.documentcloud.org/"),
          route: { id: "/" },
          data: {
            breadcrumbs: [],
          },
        },
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
      },
    },
    sidebar: {
      showRoots: false,
    },
  },
};

// Provide the MSW addon loader globally
export const loaders = [mswLoader];

export let decorators = [
  () => ViewerContextDecorator,
  () => UserContextDecorator,
  () => OrgContextDecorator,
  () => TipOfDayContextDecorator,
];

export default preview;
