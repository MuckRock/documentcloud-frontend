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
  endpoint.searchParams.set("expand", expand.join(","));

  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}

// utility functions

/**
 * Canonical URL for a document, relative to the current server
 * This will be correct in all environments, including deploy previews
 *
 * @export
 * @param {import('./types').Document} document
 * @returns {URL}
 */
export function canonicalUrl(document) {}
/**
 * Canonical URL for a single page embed, relative to the current server
 * This will be correct in all environments, including deploy previews
 *
 * @export
 * @param {import('./types').Document} document
 * @param {number} page
 * @returns {URL}
 */
export function canonicalPageUrl(document, page) {}

/**
 * Hash URL for a single page within the document viewer
 *
 * @export
 * @param {import('./types').Document} document
 * @param {number} page
 * @returns {URL}
 */
export function pageUrl(document, page) {}

/**
 * Static URL for a page image
 *
 * @export
 * @param {import('./types').Document} document
 * @param {number} page
 * @param {import('./types').sizes} size
 * @returns {URL}
 */
export function pageImageUrl(document, page, size) {}

/**
 * Asset URL for page text
 *
 * @export
 * @param {import('./types').Document} document
 * @param {number} page
 * @returns {URL}
 */
export function textUrl(document, page) {}
