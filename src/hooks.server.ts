// https://kit.svelte.dev/docs/hooks#server-hooks
import type { Handle, HandleFetch } from "@sveltejs/kit";

import { env } from "$env/dynamic/private";

import { locale } from "svelte-i18n";
import { sequence } from "@sveltejs/kit/hooks";

import { DC_BASE } from "./config/config.js";
import { log } from "$lib/utils/logging";

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  if (request.url.startsWith(DC_BASE)) {
    // handle docker issues
    event.url.protocol = "https";

    // pass through session cookie
    request.headers.append("cookie", event.request.headers.get("cookie") ?? "");

    // tell the API who we are
    request.headers.append("x-forwarded-for", event.getClientAddress());
    request.headers.set(
      "x-bypass-rate-limit",
      env.BYPASS_RATE_LIMIT_SECRET ?? "",
    );
    request.headers.append("user-agent", "MuckRock/documentcloud-frontend");
  }

  return fetch(request);
};

const language: Handle = async ({ event, resolve }) => {
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
};

const logRequest: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // logging happens after the response is generated
  log(event, response);
  return response;
};

export const handle: Handle = sequence(language, logRequest);
