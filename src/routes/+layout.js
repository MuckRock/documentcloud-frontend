import { locale, waitLocale } from "svelte-i18n";
import { browser } from "$app/environment";
import "$lib/i18n/index.js"; // Import to initialize. Important :)

export const trailingSlash = "always";

/** @type {import('./$types').LayoutLoad} */
export async function load() {
  if (browser) {
    locale.set(window.navigator.language);
  }
  await waitLocale();
}
