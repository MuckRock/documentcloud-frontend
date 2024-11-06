import { browser } from "$app/environment";
import { locale, waitLocale } from "svelte-i18n";

import "$lib/i18n/index.js"; // Import to initialize. Important :)

export const trailingSlash = "always";

export async function load() {
  if (browser) {
    const language =
      localStorage.getItem("dc-locale") || window.navigator.language;
    locale.set(language);
  }
  await waitLocale();
}
