import { error } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";
import { DEFAULT_EXPAND } from "@/api/common.js";

/**
 * Load sections from a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/24028981/sections/
 *
 * @async
 * @export
 * @param {number} doc_id
 * @param {globalThis.fetch} fetch
 * @returns {import('./types').SectionResults}
 */
export async function list(doc_id, fetch) {
  const endpoint = new URL(`documents/${doc_id}/sections.json`, BASE_API_URL);

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}

/**
 * Load a single section from a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/24028981/sections/33933/
 *
 * @async
 * @export
 * @param {number} doc_id
 * @param {globalThis.fetch} fetch
 * @returns {import('./types').Section}
 */
export async function get(doc_id, section_id, fetch) {
  const endpoint = new URL(
    `documents/${doc_id}/sections/${section_id}.json`,
    BASE_API_URL,
  );

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}
