import * as env from "$env/static/public";
import { handleErrorWithSentry, replayIntegration } from "@sentry/sveltekit";
import * as Sentry from "@sentry/sveltekit";

Sentry.init({
  // @ts-ignore
  dsn: env.PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,

  // Capture Replay for 10% of all sessions,
  replaysSessionSampleRate: 0.1,

  // plus for 50% of sessions with an error
  replaysOnErrorSampleRate: 0.5,

  // If you don't want to use Session Replay, just remove the line below:
  integrations: [replayIntegration()],
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
