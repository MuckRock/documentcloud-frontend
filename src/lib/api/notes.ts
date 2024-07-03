import { error } from "@sveltejs/kit";
import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
import { DEFAULT_EXPAND } from "@/api/common.js";
import { canonicalUrl } from "./documents";
import type { BBox, Document, Note, NoteResults } from "./types";
import { isErrorCode } from "../utils";

/**
 * Load notes from a single document from the API
 * @example https://api.www.documentcloud.org/api/documents/2622/notes/
 */
export async function list(
  doc_id: number,
  fetch = globalThis.fetch,
): Promise<NoteResults> {
  const endpoint = new URL(`documents/${doc_id}/notes/`, BASE_API_URL);

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}

/**
 * Load a single note from a single document from the API
 * @example https://api.www.documentcloud.org/api/documents/2622/notes/549/
 */
export async function get(
  doc_id: number,
  note_id: number,
  fetch = globalThis.fetch,
): Promise<Note> {
  const endpoint = new URL(
    `documents/${doc_id}/notes/${note_id}/`,
    BASE_API_URL,
  );

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}

// writing methods

/**
 * Create a new note
 *
 * @param doc_id Document ID
 * @param note Note data
 * @param csrf_token
 * @param fetch
 * @returns {Note}
 */
export async function create(
  doc_id: string | number,
  note: Partial<Note>,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Note> {
  const endpoint = new URL(`documents/${doc_id}/notes/`, BASE_API_URL);

  const resp = await fetch(endpoint, {
    body: JSON.stringify(note),
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "POST",
  }).catch(console.error);

  if (!resp) {
    throw new Error("API error");
  }

  if (!resp.ok) {
    throw new Error(resp.statusText);
  }

  return resp.json();
}

/**
 * Update a note and return the updated version
 *
 * @param doc_id Document ID
 * @param note_id Note ID
 * @param note Data to update (partial is fine)
 * @param csrf_token
 * @param fetch
 * @returns {Note}
 */
export async function update(
  doc_id: string | number,
  note_id: string | number,
  note: Partial<Note>,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Note> {
  const endpoint = new URL(
    `documents/${doc_id}/notes/${note_id}/`,
    BASE_API_URL,
  );

  const resp = await fetch(endpoint, {
    body: JSON.stringify(note),
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "PATCH",
  }).catch(console.error);

  if (!resp) {
    throw new Error("API error");
  }

  if (!resp.ok) {
    throw new Error(resp.statusText);
  }

  return resp.json();
}

/**
 * Delete a note and return the HTTP response
 *
 * @param doc_id Document ID
 * @param note_id Note ID
 * @param csrf_token
 * @param fetch
 * @returns {Response}
 */
export async function remove(
  doc_id: string | number,
  note_id: string | number,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Response> {
  const endpoint = new URL(
    `documents/${doc_id}/notes/${note_id}/`,
    BASE_API_URL,
  );

  return fetch(endpoint, {
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "DELETE",
  });
}

/**
 * Canonical URL for a note, relative to the current server
 * This will be correct in all environments, including deploy previews
 * @example https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/annotations/557
 */
export function canonicalNoteUrl(document: Document, note: Note): URL {
  return new URL(`annotations/${note.id}/`, canonicalUrl(document));
}

/**
 * Hash URL for a note within the document viewer
 * @example https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/#document/p3/a557
 */
export function noteUrl(document: Document, note: Note): URL {
  return new URL(
    `#document/p${note.page_number + 1}/a${note.id}`,
    canonicalUrl(document),
  );
}

/**
 * Generate the hash URL for a note, without the document URL
 * @param note
 * @returns hash
 */
export function noteHashUrl(note: Note): string {
  return `#document/p${note.page_number + 1}/a${note.id}`;
}

/**
 * Opposite of noteHashUrl, returning a note ID.
 * To get the page number, use pageFromHash
 * @param hash
 */
export function noteFromHash(hash: string): number {
  const re = /^#document\/p(\d+)\/a(\d+)$/;
  const match = re.exec(hash);

  if (!match) return null;

  return +match[2] || null;
}

/** Width of a note, relative to the document */
export function width(note: BBox): number {
  return note.x2 - note.x1;
}

/** Height of a note, relative to the document */
export function height(note: BBox): number {
  return note.y2 - note.y1;
}
