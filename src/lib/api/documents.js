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

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}

/**
 * Load notes from a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/2622/notes/
 *
 * @async
 * @export
 * @param {number} doc_id
 * @param {globalThis.fetch} fetch
 * @returns {import('./types').NoteResults}
 */
export async function notes(doc_id, fetch) {
  const endpoint = new URL(`documents/${doc_id}/notes.json`, BASE_API_URL);

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}

/**
 * Load a single note from a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/2622/notes/549/
 *
 * @async
 * @export
 * @param {number} doc_id
 * @param {globalThis.fetch} fetch
 * @returns {import('./types').Note}
 */
export async function note(doc_id, note_id, fetch) {
  const endpoint = new URL(
    `documents/${doc_id}/notes/${note_id}.json`,
    BASE_API_URL,
  );

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (!resp.ok) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}

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
export async function sections(doc_id, fetch) {
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
export async function section(doc_id, section_id, fetch) {
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
