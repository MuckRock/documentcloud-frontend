import { browser } from "$app/environment";
import { init, register } from "svelte-i18n";
import { LANGUAGES } from "@/config/config.js";

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
  initialLocale: browser ? window.navigator.language : defaultLocale,
});
