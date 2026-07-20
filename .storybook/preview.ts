import type { Preview } from "@storybook/sveltekit";

import "@/style/kit.css";
import "$lib/i18n/index.js";

import { initialize, mswLoader } from "msw-storybook-addon";
import TipOfDayContextDecorator from "./decorators/TipOfDayContextDecorator.svelte";
import ViewerContextDecorator from "./decorators/ViewerContextDecorator.svelte";

import { me, myOrgs, organization, usersList } from "@/test/fixtures/accounts";

// Initialize MSW (v2 API)
initialize({
  onUnhandledRequest: "bypass",
  serviceWorker: {
    url: "./mockServiceWorker.js",
  },
});

// Set a mock CSRF token cookie for MSW-backed stories that hit the API
// (getCsrfToken() reads `csrftoken` from document.cookie). This replaces
// storybook-addon-cookie, which is incompatible with Storybook 9+.
if (typeof document !== "undefined") {
  document.cookie = "csrftoken=mockToken; path=/";
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    sveltekit_experimental: {
      // The app reads `page` from `$app/state`; @storybook/sveltekit 10 mocks
      // it from this `state` block.
      state: {
        page: {
          url: new URL("https://www.documentcloud.org/"),
          route: { id: "/" },
          data: {
            breadcrumbs: [],
            // Signed in as `me` by default; individual stories override
            // `data.me` (e.g. to `undefined`) for signed-out scenarios.
            me,
            org: organization,
            user_orgs: myOrgs.results,
            org_users: usersList.results,
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
  () => TipOfDayContextDecorator,
];

export default preview;
