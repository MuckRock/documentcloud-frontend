import type { Preview, StoryContext, StoryFn } from "@storybook/svelte";

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
      // NOTE: @storybook/sveltekit 8.6 only mocks `$app/stores`; it ignores
      // this `state` block, so components reading `$app/state` (page.url) get an
      // unpopulated value in Storybook. Kept in sync with `stores` above so it
      // starts working once Storybook is upgraded to a version that mocks
      // `$app/state`. Production/tests are unaffected.
      state: {
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
  (_story: StoryFn, context: StoryContext) => ({
    Component: UserContextDecorator,
    props: { context },
  }),
  () => OrgContextDecorator,
  () => TipOfDayContextDecorator,
];

export default preview;
