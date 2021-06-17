import {
  addMessages,
  register,
  init,
  getLocaleFromNavigator,
} from "svelte-i18n";

register("en", () => import("../langs/en.json"));
register("es", () => import("../langs/es.json"));
register("pl", () => import("../langs/pl.json"));

init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromNavigator(),
  //initialLocale: "pl",
});
