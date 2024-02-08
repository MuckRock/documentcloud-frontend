/** API helpers related to documents */

import { BASE_API_URL } from "@/config/config.js";
import {
  DEFAULT_ORDERING,
  DEFAULT_EXPAND,
  USER_EXPAND,
  ORG_EXPAND,
} from "@/api/common.js";

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
    throw new Error(resp.statusText);
  }

  return resp.json();
}
