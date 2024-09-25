import type { DocumentResults } from "$lib/api/types";

import { error } from "@sveltejs/kit";

import * as addons from "$lib/api/addons";
import { search } from "$lib/api/documents";
import { breadcrumbTrail } from "$lib/utils/navigation";
import { userDocs } from "$lib/utils/search";

export async function load({ url, params, fetch, parent }) {
  const { owner, repo } = params;

  const addon = await addons.getAddon(owner, repo, fetch).catch(console.error);
  if (!addon) {
    return error(404, "Add-On not found");
  }

  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: url.pathname, title: addon.name },
  ]);

  const { me } = await parent();
  const query = url.searchParams.get("q") || userDocs(me);

  const searchResults = search(query, {}, fetch).then((r) => r.data);

  return {
    addon,
    breadcrumbs,
    query,
    searchResults,
    scheduled: addons
      .scheduled({ addon: addon.id, per_page: 100 }, fetch)
      .then((r) => r.data),
  };
}
