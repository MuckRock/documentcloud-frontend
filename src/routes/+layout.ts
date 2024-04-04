import { locale, waitLocale } from "svelte-i18n";
import { browser } from "$app/environment";
import { getMe, getOrg } from "$lib/api/accounts";

import "$lib/i18n/index.js"; // Import to initialize. Important :)

export const trailingSlash = "always";

export async function load({ fetch, url }) {
  if (browser) {
    locale.set(window.navigator.language);
  }
  await waitLocale();

  const embed =
    url.hostname === "embed.documentcloud.org" || url.searchParams.has("embed");

  // todo: ensure this doesn't load for embeds
  const me = await getMe(fetch);
  let org;
  if (typeof me.organization === "number") {
    org = await getOrg(fetch, me.organization);
  } else {
    org = me.organization;
  }

  return { me, org, embed };
}
