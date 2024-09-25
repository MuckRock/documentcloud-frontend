import type { DocumentResults, SearchOptions } from "$lib/api/types";

import { DEFAULT_PER_PAGE } from "@/config/config.js";
import { search, pending } from "$lib/api/documents";
import { getPinnedAddons } from "$lib/api/addons.js";

export async function load({ url, fetch, data }) {
  const query = url.searchParams.get("q") || "";
  const per_page = +url.searchParams.get("per_page") || DEFAULT_PER_PAGE;
  const cursor = url.searchParams.get("cursor") || "";

  const options: SearchOptions = {
    hl: Boolean(query),
    version: "2.0",
  };

  if (per_page) {
    options.per_page = per_page;
  }

  if (cursor) {
    options.cursor = cursor;
  }

  const searchResults = search(query, options, fetch);

  const pinnedAddons = getPinnedAddons(fetch);

  return {
    ...data,
    query,
    per_page,
    cursor,
    searchResults,
    pending: pending(fetch),
    pinnedAddons,
  };
}
