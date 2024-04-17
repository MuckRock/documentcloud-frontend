import { error } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";
import { DEFAULT_EXPAND } from "@/api/common.js";
import { canonicalUrl } from "./documents";
import type { Document, Note, NoteResults } from "./types";
import { isErrorCode } from "../utils";

/**
 * Load notes from a single document from the API
 * @example https://api.www.documentcloud.org/api/documents/2622/notes/
 */
export async function list(
  doc_id: number,
  fetch = globalThis.fetch,
): Promise<NoteResults> {
  const endpoint = new URL(`documents/${doc_id}/notes.json`, BASE_API_URL);

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
    `documents/${doc_id}/notes/${note_id}.json`,
    BASE_API_URL,
  );

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);

  const resp = await fetch(endpoint, { credentials: "include" });

  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
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

/** Width of a note, relative to the document */
export function width(note: Note): number {
  return note.x2 - note.x1;
}

/** Height of a note, relative to the document */
export function height(note: Note): number {
  return note.y2 - note.y1;
}
