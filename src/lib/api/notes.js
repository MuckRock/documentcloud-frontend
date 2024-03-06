import { error } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";
import { DEFAULT_EXPAND } from "@/api/common.js";
import { canonicalUrl } from "./documents";

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

/**
 * Canonical URL for a note, relative to the current server
 * This will be correct in all environments, including deploy previews
 * https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/annotations/557
 *
 * @export
 * @param {import('./types').Document} document
 * @param {import('./types').Note} note
 * @returns {URL}
 */
export function canonicalNoteUrl(document, note) {
  return new URL(`annotations/${note.id}/`, canonicalUrl(document));
}

/**
 * Hash URL for a note within the document viewer
 * https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/#document/p3/a557
 *
 * @export
 * @param {import('./types').Document} document
 * @param {import('./types').Note} note
 * @returns {URL}
 */
export function noteUrl(document, note) {
  return new URL(
    `#document/p${note.page_number + 1}/a${note.id}`,
    canonicalUrl(document),
  );
}

/**
 * Width of a note, relative to the document
 *
 * @export
 * @param {import('./types').Note} note
 * @returns {number}
 */
export function width(note) {
  return note.x2 - note.x1;
}

/**
 * Height of a note, relative to the document
 *
 * @export
 * @param {import('./types').Note} note
 * @returns {number}
 */
export function height(note) {
  return note.y2 - note.y1;
}
