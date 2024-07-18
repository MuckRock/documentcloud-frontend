import type { DocumentResults, SearchOptions } from "$lib/api/types";

import { error } from "@sveltejs/kit";

import { getAddon } from "@/lib/api/addons.js";
import { search } from "$lib/api/documents";
import { breadcrumbTrail } from "$lib/utils/navigation";
import { userDocs } from "$lib/utils/search";

export async function load({ url, params, fetch, parent }) {
  const { owner, repo } = params;

  const addon = await getAddon(owner, repo, fetch).catch(console.error);
  if (!addon) {
    return error(404, "Add-On not found");
  }

  const breadcrumbs = await breadcrumbTrail(parent, [
    { href: url.pathname, title: addon.name },
  ]);

  const { me } = await parent();
  const query = url.searchParams.get("q") || userDocs(me);

  const searchResults = search(query, {}, fetch).catch((e) => {
    console.error(e);
    return {
      results: [],
      count: 0,
      next: null,
    } as DocumentResults;
  });

  return {
    addon,
    breadcrumbs,
    query,
    searchResults,
  };
}
