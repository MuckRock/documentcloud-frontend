import { search } from "$lib/api/documents.js";
import { getPinnedAddons } from "$lib/api/addons";

export async function load({ url, fetch }) {
  const query = url.searchParams.get("q") || "";

  const searchResults = search(query, true, fetch);
  const pinnedAddons = getPinnedAddons();

  return {
    searchResults,
    query,
    pinnedAddons,
  };
}
