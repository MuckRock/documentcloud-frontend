import type { Org, User } from "@/api/types/orgAndUser.js";
import { locale, waitLocale } from "svelte-i18n";
import { browser } from "$app/environment";
import { getMe, orgUsers, userOrgs } from "$lib/api/accounts";

import "$lib/i18n/index.js"; // Import to initialize. Important :)
import { getTipOfDay } from "@/lib/api/flatpages.js";

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
  const org = me?.organization as Org;
  const tipOfDay = me ? await getTipOfDay(fetch) : null;

  let user_orgs: Promise<Org[]>, org_users: Promise<User[]>;
  if (me && org) {
    user_orgs = userOrgs(me, fetch).catch((e) => {
      console.error(e);
      return [];
    });
    org_users = orgUsers(org, fetch).catch((e) => {
      console.error(e);
      return [];
    });
  }

  return { me, org, tipOfDay, embed, breadcrumbs: [], user_orgs, org_users };
}
