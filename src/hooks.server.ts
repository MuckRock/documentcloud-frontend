// https://kit.svelte.dev/docs/hooks#server-hooks
import type { Handle } from "@sveltejs/kit";

import { env } from "$env/dynamic/private";

import { locale } from "svelte-i18n";
import { sequence } from "@sveltejs/kit/hooks";

import { DC_BASE } from "./config/config.js";
import { log } from "$lib/utils/logging";

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ event, request, fetch }) {
  if (request.url.startsWith(DC_BASE)) {
    // handle docker issues
    event.url.protocol = "https";

    // Create new headers with the cookies and other required headers
    const headers = new Headers(request.headers);

    // pass through session cookie
    headers.append("cookie", event.request.headers.get("cookie") ?? "");

    // tell the API who we are
    headers.append("x-forwarded-for", event.getClientAddress());
    headers.set(
      "x-bypass-rate-limit",
      env.BYPASS_RATE_LIMIT_SECRET ?? "",
    );

    // Create a new request with the modified headers
    request = new Request(request, { headers });
  }

  return fetch(request);
}

/** @type {import('@sveltejs/kit').Handle} */
async function language({ event, resolve }) {
  const lang =
    event.request.headers.get("accept-language")?.split(",")[0] ?? "en";

  // use en.json for en-US and such
  const [language, ...tags] = lang.split("-");

  if (language) {
    locale.set(language);
  }

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%lang%", lang),
  });
}

/** @type {import('@sveltejs/kit').Handle} */
async function logRequest({ event, resolve }) {
  const response = await resolve(event);

  // logging happens after the response is generated
  log(event, response);
  return response;
}

export const handle: Handle = sequence(
  language,
  logRequest,
);
