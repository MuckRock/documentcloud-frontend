// https://kit.svelte.dev/docs/hooks#server-hooks
import { locale } from "svelte-i18n";
import { DC_BASE } from "./config/config.js";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const lang = event.request.headers.get("accept-language")?.split(",")[0];
  if (lang) {
    locale.set(lang);
  }
  return resolve(event);
}

/** @type {import('@sveltejs/kit').HandleFetch} */
export async function handleFetch({ event, request, fetch }) {
  if (request.url.startsWith(DC_BASE)) {
    // handle docker issues
    event.url.protocol = "https";
    request.headers.set("cookie", event.request.headers.get("cookie"));
  }

  return fetch(request);
}
