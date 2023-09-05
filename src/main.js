import * as Sentry from "@sentry/svelte";
import Main from "./Main.svelte";

const SENTRY_DSN = process.env.SENTRY_DSN;

// init sentry first
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,

    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [
      "http://www.dev.documentcloud.org",
      "https://www.staging.documentcloud.org",
      "https://www.documentcloud.org",
    ],

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
} else {
  console.log("Sentry is not configured. Set SENTRY_DSN to enable.");
}

// Imports to get persistent app functionality working
import "./manager/orgsAndUsers.js";

const app = new Main({
  target: document.body,
});

window.app = app;
