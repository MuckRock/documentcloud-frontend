import { browser } from "$app/environment";
import { init, register } from "svelte-i18n";
import { LANGUAGES } from "@/config/config.js";

const defaultLocale = "en";

LANGUAGES.forEach(([name, code, flag]) => {
  register(code, () => import(`../../langs/json/${code}.json`));
});

init({
  fallbackLocale: defaultLocale,
  initialLocale: browser ? window.navigator.language : defaultLocale,
});
