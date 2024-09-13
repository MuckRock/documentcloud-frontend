import { browser } from "$app/environment";
import { locale, waitLocale } from "svelte-i18n";

import "$lib/i18n/index.js"; // Import to initialize. Important :)

export const trailingSlash = "always";

export async function load({ fetch, url }) {
  if (browser) {
    locale.set(window.navigator.language);
  }
  await waitLocale();
}
