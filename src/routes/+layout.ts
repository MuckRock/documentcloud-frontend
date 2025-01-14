import { browser } from "$app/environment";
import { locale, waitLocale } from "svelte-i18n";
import { getLanguage } from "$lib/utils/language";

import "$lib/i18n/index.js"; // Import to initialize. Important :)

export async function load() {
  if (browser) {
    let lang: string;
    try {
      lang = localStorage.getItem("dc-locale") || window.navigator.language;
    } catch {
      lang = window.navigator.language;
    }

    // use en.json for en-US and such
    const language = getLanguage(lang, "en");

    locale.set(language);
  }
  await waitLocale();
}
