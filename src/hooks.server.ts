// https://kit.svelte.dev/docs/hooks#server-hooks
import type { Handle } from "@sveltejs/kit";

import { env } from "$env/dynamic/private";

import { sequence } from "@sveltejs/kit/hooks";
import * as Sentry from "@sentry/sveltekit";
import { locale } from "svelte-i18n";

import { DC_BASE } from "./config/config.js";

Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 1,
});

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ event, request, fetch }) {
  if (request.url.startsWith(DC_BASE)) {
    // handle docker issues
    event.url.protocol = "https";
    request.headers.set("cookie", event.request.headers.get("cookie"));
  }

  return fetch(request);
}

export const handleError = Sentry.handleErrorWithSentry();

/** @type {import('@sveltejs/kit').Handle} */
async function language({ event, resolve }) {
  const lang =
    event.request.headers.get("accept-language")?.split(",")[0] ?? "en-US";

  if (lang) {
    locale.set(lang);
  }

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%lang%", lang),
  });
}

export const handle: Handle = sequence(Sentry.sentryHandle(), language);
