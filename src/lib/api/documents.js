/** API helpers related to documents.
 * Lots of duplicated code here that should get consolidated at some point.
 */
import { error } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";
import { DEFAULT_EXPAND } from "@/api/common.js";

/**
 * Search documents
 *
 * @async
 * @param {query} string
 * @param {boolean} highlight
 * @param {globalThis.fetch} fetch
 * @returns {import('./types').DocumentResults}
 */
export async function search(
  query = "",
  highlight = false,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL("documents/search/", BASE_API_URL);

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);
  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("hl", highlight);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}

/**
 * Load a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/1/
 *
 * @async
 * @export
 * @param {number} id
 * @param {globalThis.fetch} fetch
 * @returns {import('./types').Document}
 */
export async function get(id, fetch) {
  const endpoint = new URL(`documents/${id}.json`, BASE_API_URL);
  const expand = ["user", "organization", "projects", "revisions"];
  endpoint.searchParams.set("expand", expand);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}
