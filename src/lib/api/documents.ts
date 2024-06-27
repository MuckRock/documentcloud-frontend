/** API helpers related to documents.
 * Lots of duplicated code here that should get consolidated at some point.
 */
import type {
  Document,
  DocumentText,
  DocumentUpload,
  DocumentResults,
  Pending,
  Redaction,
  SearchOptions,
  Sizes,
  Status,
  TextPosition,
  ViewerMode,
} from "./types";

import { writable, type Writable } from "svelte/store";
import { error } from "@sveltejs/kit";
import { DEFAULT_EXPAND } from "@/api/common.js";
import { isOrg } from "@/api/types/orgAndUser";
import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  DC_BASE,
} from "@/config/config.js";
import { isErrorCode, getPrivateAsset } from "../utils/index";

export const READING_MODES = new Set<ViewerMode>([
  "document",
  "text",
  "grid",
  "notes",
]);

export const WRITING_MODES = new Set<ViewerMode>(["annotating", "redacting"]);

// for keeping track of deleted documents that haven't been purged from search yet
export const deleted: Writable<Set<string>> = writable(new Set());

/**
 * Search documents
 * https://www.documentcloud.org/help/search/
 *
 *  */
export async function search(
  query = "",
  options: SearchOptions = {
    hl: Boolean(query),
    per_page: 25,
    cursor: "",
    version: "2.0",
  },
  fetch = globalThis.fetch,
): Promise<DocumentResults> {
  const endpoint = new URL("documents/search/", BASE_API_URL);

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);
  endpoint.searchParams.set("q", query);

  for (const [k, v] of Object.entries(options)) {
    if (v) {
      endpoint.searchParams.set(k, String(v));
    }
  }

  const resp = await fetch(endpoint, { credentials: "include" });

  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}

/**
 * Load a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/1/
 */
export async function get(
  id: number,
  fetch: typeof globalThis.fetch = globalThis.fetch,
): Promise<Document> {
  const endpoint = new URL(`documents/${id}.json`, BASE_API_URL);
  const expand = [
    "user",
    "organization",
    "projects",
    "revisions",
    "sections",
    "notes.user",
  ];
  endpoint.searchParams.set("expand", expand.join(","));

  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.error,
  );

  // backend error, not much we can do
  if (!resp) {
    error(500);
  }

  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }

  return resp.json();
}

/**
 * Get text for a document. It may be a private asset, which requires a two-step fetch.
 */
export async function text(
  document: Document,
  fetch = globalThis.fetch,
): Promise<DocumentText> {
  // for errors
  const empty = { updated: 0, pages: [] };
  let url = jsonUrl(document);

  // for public documents, we can just fetch the asset
  // for private and organization docs, we need to hit the API first
  // with credentials, and then fetch the returned location
  if (document.access !== "public") {
    url = await getPrivateAsset(url, fetch);
  }

  const resp = await fetch(url).catch(console.error);
  if (!resp || isErrorCode(resp.status)) {
    return empty;
  }
  return resp.json();
}

/**
 * Fetch text positions for a single page of a document.
 * Since older documents don't have selectable text, this will
 * return an empty array in failure cases.
 */
export async function textPositions(
  document: Document,
  page: number,
  fetch = globalThis.fetch,
): Promise<TextPosition[]> {
  let url = selectableTextUrl(document, page);

  if (document.access !== "public") {
    try {
      url = await getPrivateAsset(url);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  const resp = await fetch(url).catch(console.error);
  if (!resp || isErrorCode(resp.status)) {
    return [];
  }

  return resp.json();
}

/**
 * Create new documents in a batch (or a batch of one).
 *
 * If documents contain a `file_url` property, the server will attempt to fetch and upload that file.
 * Otherwise, the response will contain all documents fields plus a `presigned_url` field, which should
 * be passed to `upload` to store the actual file.
 *
 * @async
 * @export
 */
export async function create(
  documents: DocumentUpload[],
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Document[]> {
  const endpoint = new URL("documents/", BASE_API_URL);

  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(documents),
  });

  if (isErrorCode(resp.status)) {
    throw new Error(await resp.text());
  }

  return resp.json() as Promise<Document[]>;
}

/**
 * Upload file data to a presigned_url on cloud storage.
 * Use this after running `create` to add documents to the database.
 * This function is a very thin wrapper around fetch.
 *
 * @async
 * @export
 */
export async function upload(
  presigned_url: URL,
  file: File,
  fetch = globalThis.fetch,
): Promise<Response> {
  return fetch(presigned_url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
}

/**
 * Tell the backend to begin processing a batch of documents.
 *
 * @async
 * @export
 */
export async function process(
  documents: {
    id: string | number;
    force_ocr?: boolean;
    ocr_engine?: string;
  }[],
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Response> {
  const endpoint = new URL("documents/process/", BASE_API_URL);

  return fetch(endpoint, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(documents),
  });
}

/**
 * Stop processing a document
 */
export async function cancel(
  document: Document,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Response | undefined> {
  const processing: Set<Status> = new Set(["pending", "readable"]);

  // non-processing status is a no-op
  if (!processing.has(document.status)) return;

  const endpoint = new URL(`documents/${document.id}/process/`, BASE_API_URL);

  return fetch(endpoint, {
    credentials: "include",
    method: "DELETE",
    headers: {
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
  });
}

/**
 * Delete a document. There is no undo.
 *
 * @param id
 * @param csrf_token
 * @param fetch
 */
export async function destroy(
  id: string | number,
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(`documents/${id}/`, BASE_API_URL);

  return fetch(endpoint, {
    credentials: "include",
    method: "DELETE",
    headers: {
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
  });
}

/**
 * Edit the top-level fields of a document with a PATCH request
 *
 * @param id Document ID
 * @param data Fields to update
 * @param csrf_token
 * @param fetch
 * @returns Updated document
 */
export async function edit(
  id: number | string,
  data: Partial<Document>,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Document> {
  const endpoint = new URL(`documents/${id}/`, BASE_API_URL);

  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(data),
  }).catch(console.error);

  if (!resp) {
    throw new Error("API unavailable");
  }

  if (isErrorCode(resp.status)) {
    throw new Error(await resp.json());
  }

  return resp.json();
}

export async function redact(
  id: number | string,
  redactions: Redaction[],
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(`documents/${id}/redactions/`, BASE_API_URL);

  // redaction is a fire-and-reprocess method, so all we have to go on is a response
  return fetch(endpoint, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(redactions),
  });
}

/**
 * Get pending documents. This returns an empty array for any error.
 *
 * @param {fetch} fetch
 * @returns {Promise<Pending>}
 */
export async function pending(fetch = globalThis.fetch): Promise<Pending[]> {
  const endpoint = new URL("documents/pending/", BASE_API_URL);

  try {
    const resp = await fetch(endpoint, { credentials: "include" });
    if (isErrorCode(resp.status)) return [];
    return resp.json();
  } catch (e) {
    return [];
  }
}

// utility functions

/**
 * Get the asset URL for a document, handling the private redirect if needed
 * @param document
 * @returns {Promise<URL>}
 */
export async function assetUrl(
  document: Document,
  fetch = globalThis.fetch,
): Promise<URL> {
  let asset_url = pdfUrl(document);

  // assets still processing are in private storage until finished
  if (document.access !== "public" || String(asset_url).startsWith(DC_BASE)) {
    asset_url = await getPrivateAsset(asset_url, fetch).catch((e) => {
      console.error(e);
      console.error(asset_url.href);
      return asset_url;
    });
  }

  return asset_url;
}

/**
 * Canonical URL for a document, relative to the current server
 * This will be correct in all environments, including deploy previews
 *
 * @export
 * @param {import('./types').Document} document
 * @returns {URL}
 */
export function canonicalUrl(document: Document): URL {
  const path = `/documents/${document.id}-${document.slug}/`;
  return new URL(path, APP_URL);
}

/**
 * Canonical URL for a single page embed, relative to the current server
 * This will be correct in all environments, including deploy previews
 *
 * @export
 * @param {import('./types').Document} document
 * @param {number} page
 * @returns {URL}
 */
export function canonicalPageUrl(document: Document, page: number): URL {
  return new URL(`/documents/${document.id}/pages/${page}/`, APP_URL);
}

/**
 * Generate the hash for a path, without the host or path
 *
 * @export
 */
export function pageHashUrl(page: number): string {
  return `#document/p${page}`;
}

/**
 * The opposite of pageHashUrl, extracting a page number from a URL hash.
 * Note that this will also match note hash URLs, which use the same prefix.
 *
 * @param hash URL hash
 */
export function pageFromHash(hash: string): number {
  const re = /^#document\/p(\d+)/; // match pages and notes
  const match = re.exec(hash);

  if (!match) return 1;

  return +match[1] || 1;
}

/**
 * Hash URL for a single page within the document viewer
 *
 * @export
 * @param {import('./types').Document} document
 * @param {number} page
 * @returns {URL}
 */
export function pageUrl(document: Document, page: number): URL {
  return new URL(pageHashUrl(page), canonicalUrl(document));
}

/**
 * Static URL for a page image
 *
 * @export
 * @param {import('./types').Document} document
 * @param {number} page number, 1-indexed
 * @param {import('./types').sizes} size
 * @returns {URL}
 */
export function pageImageUrl(
  document: Document,
  page: number,
  size: Sizes,
): URL {
  return new URL(
    `documents/${document.id}/pages/${document.slug}-p${page}-${size}.gif`,
    document.asset_url,
  );
}

/**
 * Asset URL for page text
 *
 * @export
 */
export function textUrl(document: Document, page: number): URL {
  return new URL(
    `documents/${document.id}/pages/${document.slug}-p${page}.txt`,
    document.asset_url,
  );
}

/**
 * Asset URL for JSON text
 *
 * @export
 */
export function jsonUrl(document: Document): URL {
  return new URL(
    `documents/${document.id}/${document.slug}.txt.json`,
    document.asset_url,
  );
}

/**
 * Asset URL for text positions
 *
 * @export
 */
export function selectableTextUrl(document: Document, page: number): URL {
  return new URL(
    `documents/${document.id}/pages/${document.slug}-p${page}.position.json`,
    document.asset_url,
  );
}

/**
 * Generate URL for the PDF version of a document.
 * This will always be a PDF, regardless of the original file type.
 *
 * @export
 */
export function pdfUrl(document: Document): URL {
  return new URL(
    `documents/${document.id}/${document.slug}.pdf`,
    document.asset_url,
  );
}

/**
 * Generate a user (organization) string
 *
 * @export
 */
export function userOrgString(document: Document): string {
  // we have an org and user
  if (isOrg(document.organization) && typeof document.user === "object") {
    return `${document.user.name} (${document.organization.name})`;
  }

  // just a user
  if (typeof document.user === "object") {
    return document.user.name;
  }

  // nothing, so return nothing
  return "";
}

/**
 * Whether a page should preload a document asset, based on viewer mode
 * @param mode viewer mode
 * @returns {boolean}
 */
export function shouldPreload(mode: ViewerMode): boolean {
  return ["document", "notes", "redacting", "annotating"].includes(mode);
}

/**
 * Whether a viewer mode is paginated
 * @param mode
 * @returns {boolean}
 */
export function shouldPaginate(mode: ViewerMode): boolean {
  return ["document", "text", "annotating", "redacting"].includes(mode);
}

/**
 * Is the document still processing?
 * @param status
 * @returns {boolean}
 */
export function isProcessing(status: Status): boolean {
  return ["pending", "readable", "nofile"].includes(status);
}
