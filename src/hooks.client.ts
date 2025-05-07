import * as env from "$env/static/public";
import { handleErrorWithSentry, replayIntegration } from "@sentry/sveltekit";
import * as Sentry from "@sentry/sveltekit";

Sentry.init({
  // @ts-ignore
  dsn: env.PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.05,
  environment: window.location.hostname,

  // Capture Replay for 10% of all sessions,
  replaysSessionSampleRate: 0.1,

  // plus for 50% of sessions with an error
  replaysOnErrorSampleRate: 0.25,

  // If you don't want to use Session Replay, just remove the line below:
  integrations: [
    // replayIntegration(),
    Sentry.captureConsoleIntegration({ levels: ["error"] }),
  ],
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
