import { browser } from "$app/environment";
import { init, register } from "svelte-i18n";
import { LANGUAGES } from "@/config/config.js";
import { getLanguage } from "../utils/language";

const defaultLocale = "en";

LANGUAGES.forEach(([name, code, flag]) => {
  if (code) {
    register(code, () => import(`@/langs/json/${code}.json`));
  }
});

// handle two-part locales
register("en-US", () => import("@/langs/json/en.json"));
register("en-GB", () => import("@/langs/json/en.json"));

init({
  fallbackLocale: defaultLocale,
  initialLocale: browser
    ? getLanguage(window.navigator?.language ?? defaultLocale)
    : defaultLocale,
});
