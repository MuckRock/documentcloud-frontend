import {
  register,
  init,
  getLocaleFromNavigator,
  format,
  date as _date,
  time as _time,
} from "svelte-i18n";
import langs from "./langs.json";

const langDict = {};
for (let i = 0; i < langs.length; i++) {
  const lang = langs[i][1];
  register(lang, () => import(`../langs/json/${lang}.json`));
  langDict[lang] = true;
}

function resolveLocale(locale) {
  if (locale == null) return locale;
  if (langDict[locale] != null) return locale;
  if (langDict[locale.split("-")[0]] != null) return locale.split("-")[0];
  return locale;
}

function getStoredLocale() {
  try {
    return localStorage.getItem("dc-locale");
  } catch (e) {
    return null;
  }
}

init({
  fallbackLocale: "en",
  initialLocale: resolveLocale(getStoredLocale() || getLocaleFromNavigator()),
});

// Add token set method to get i18n to play nicely with Svue;
format.set = () => {};
_date.set = () => {};
_time.set = () => {};
export const _ = format;
export const date = _date;
export const time = _time;
