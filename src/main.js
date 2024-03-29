import Main from "./Main.svelte";

const SENTRY_DSN = process.env.SENTRY_DSN;
const IS_EMBED =
  typeof window !== "undefined" &&
  (window.location.hostname === "embed.documentcloud.org" ||
    new URLSearchParams(window.location.search).has("embed"));

// init sentry first
if (!IS_EMBED && SENTRY_DSN) {
  import("@sentry/svelte").then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 0.25,

      // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [
        "http://www.dev.documentcloud.org",
        "https://*.muckcloud.com",
        "https://www.documentcloud.org",
      ],

      // Capture Replay for 10% of all sessions,
      // plus for 50% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 0.5,
    });
  });
} else {
  if (!IS_EMBED)
    console.log("Sentry is not configured. Set SENTRY_DSN to enable.");
}

// Imports to get persistent app functionality working
import "./manager/orgsAndUsers.js";

const app = new Main({
  target: document.body,
});

window.app = app;
