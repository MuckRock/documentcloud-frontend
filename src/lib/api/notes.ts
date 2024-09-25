import type {
  APIResponse,
  BBox,
  Document,
  Note,
  NoteResults,
  ValidationError,
} from "./types";

import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  EMBED_URL,
} from "@/config/config.js";
import { DEFAULT_EXPAND } from "@/api/common.js";
import { canonicalUrl } from "./documents";
import { getApiResponse, isErrorCode } from "../utils";

/**
 * Load notes from a single document from the API
 * @example https://api.www.documentcloud.org/api/documents/2622/notes/
 * @deprecated
 */
export async function list(doc_id: number, fetch = globalThis.fetch) {
  const endpoint = new URL(`documents/${doc_id}/notes/`, BASE_API_URL);

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (isErrorCode(resp.status)) {
    throw new Error(resp.statusText);
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
): Promise<APIResponse<Note, unknown>> {
  const endpoint = new URL(
    `documents/${doc_id}/notes/${note_id}/`,
    BASE_API_URL,
  );

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  return getApiResponse<Note>(resp);
}

// writing methods

/**
 * Create a new note
 */
export async function create(
  doc_id: string | number,
  note: Partial<Note>,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Note, ValidationError>> {
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
  });

  return getApiResponse<Note, ValidationError>(resp);
}

/**
 * Update a note and return the updated version
 */
export async function update(
  doc_id: string | number,
  note_id: string | number,
  note: Partial<Note>,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Note, ValidationError>> {
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
  });

  return getApiResponse<Note, ValidationError>(resp);
}

/**
 * Delete a note
 */
export async function remove(
  doc_id: string | number,
  note_id: string | number,
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(
    `documents/${doc_id}/notes/${note_id}/`,
    BASE_API_URL,
  );

  const resp = await fetch(endpoint, {
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "DELETE",
  });

  return getApiResponse<null>(resp);
}

/**
 * Canonical URL for a note, relative to the current server
 * This will be correct in all environments, including deploy previews
 * @example https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/annotations/557
 */
export function canonicalNoteUrl(document: Document, note: Note): URL {
  return new URL(
    `/documents/${document.id}/annotations/${note.id}/`,
    EMBED_URL,
  );
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

export function isPageLevel(note: Partial<Note>): boolean {
  if (!note) return false;
  return [note?.x1, note?.x2, note?.y1, note?.y2].every(
    (n) => n === undefined || n === null,
  );
}
