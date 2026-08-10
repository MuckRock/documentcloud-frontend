import type { Preview } from "@storybook/sveltekit";

import "@/style/kit.css";
import "$lib/i18n/index.js";

import { mswLoader } from "msw-storybook-addon/csf3";
import ViewerContextDecorator from "./decorators/ViewerContextDecorator.svelte";

import { me, myOrgs, organization, usersList } from "@/test/fixtures/accounts";

// msw-storybook-addon 3 dropped `initialize()`; worker setup now happens in a
// function handed to the loader. The `/csf3` entry point is the supported
// integration for CSF 3.0 stories and keeps `parameters.msw.handlers` working —
// the CSF Next `addonMsw()` API ignores that parameter.
async function setupMsw() {
  const { setupWorker } = await import("msw/browser");
  const worker = setupWorker();

  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "./mockServiceWorker.js",
    },
  });

  return worker;
}

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
            tipOfDay: {
              url: "/tipofday/",
              title: "Tip of the Day",
              content:
                '<p>Welcome to DocumentCloud, the <a href="#">SvelteKit</a> rewrite!</p>',
            },
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
export const loaders = [mswLoader(setupMsw)];

export let decorators = [() => ViewerContextDecorator];

export default preview;
