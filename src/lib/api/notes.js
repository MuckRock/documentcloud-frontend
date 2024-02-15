import { error } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";
import { DEFAULT_EXPAND } from "@/api/common.js";

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
export async function list(doc_id, fetch) {
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
export async function get(doc_id, note_id, fetch) {
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
