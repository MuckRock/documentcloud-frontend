import { locale, waitLocale } from "svelte-i18n";
import { browser } from "$app/environment";
import { BASE_API_URL } from "@/config/config.js";
import "$lib/i18n/index.js"; // Import to initialize. Important :)

export const trailingSlash = "always";

const endpoint = new URL("users/me/", BASE_API_URL);

/** @type {import('./$types').LayoutLoad} */
export async function load({ fetch }) {
  if (browser) {
    locale.set(window.navigator.language);
  }
  await waitLocale();

  const me = await getMe(fetch);

  return { me };
}

/**
 * Get the current logged-in user, or null
 *
 * @param {fetch} fetch
 * @return {*}
 */
async function getMe(fetch) {
  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    return null;
  }

  return resp.json();
}
