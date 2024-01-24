// https://kit.svelte.dev/docs/hooks#server-hooks
import { locale } from "svelte-i18n";

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const lang = event.request.headers.get("accept-language")?.split(",")[0];
  if (lang) {
    locale.set(lang);
  }
  return resolve(event);
}
