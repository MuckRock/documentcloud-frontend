/** API helpers related to documents.
 * Lots of duplicated code here that should get consolidated at some point.
 */
import type {
  APIResponse,
  Data,
  DataUpdate,
  Document,
  DocumentFilters,
  DocumentText,
  DocumentUpload,
  DocumentResults,
  Pending,
  Redaction,
  SearchOptions,
  Sizes,
  Status,
  TextPosition,
  ReadMode,
  WriteMode,
  ViewerMode,
  ValidationError,
  Nullable,
} from "./types";

import { writable, type Writable } from "svelte/store";
import { DEFAULT_EXPAND } from "@/api/common.js";
import { getUserName, isOrg } from "./accounts";
import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  DC_BASE,
  EMBED_URL,
} from "@/config/config.js";
import { isErrorCode, getPrivateAsset, getApiResponse } from "../utils/api";

export const READING_MODES = new Set<ReadMode>([
  "document",
  "text",
  "grid",
  "notes",
]);

export const WRITING_MODES = new Set<WriteMode>(["annotating", "redacting"]);

export const MODES = new Set<ViewerMode>([...READING_MODES, ...WRITING_MODES]);

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
): Promise<APIResponse<DocumentResults, null>> {
  const endpoint = new URL("documents/search/", BASE_API_URL);

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);
  endpoint.searchParams.set("q", query);

  for (const [k, v] of Object.entries(options)) {
    if (v) {
      endpoint.searchParams.set(k, String(v));
    }
  }

  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.error,
  );

  return getApiResponse<DocumentResults, null>(resp);
}

/**
 * Load a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/1/
 */
export async function get(
  id: string | number,
  fetch: typeof globalThis.fetch = globalThis.fetch,
): Promise<APIResponse<Document, null>> {
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

  return getApiResponse<Document, null>(resp);
}

/**
 * Get a filtered list of documents from the database, not from search.
 * This will be slower than using search but allows more filtering.
 *
 * @param params Filter documents
 * @param fetch
 */
export async function list(
  params: DocumentFilters,
  fetch = globalThis.fetch,
): Promise<APIResponse<DocumentResults, unknown>> {
  const endpoint = new URL("documents/", BASE_API_URL);

  for (const [k, v] of Object.entries(params)) {
    endpoint.searchParams.set(k, String(v));
  }

  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.error,
  );

  return getApiResponse<DocumentResults>(resp);
}

/**
 * Get text for a document. It may be a private asset, which requires a two-step fetch.
 * Errors will produce an empty response.
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
 */
export async function create(
  documents: DocumentUpload[],
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Document[], unknown>> {
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
  }).catch(console.error);

  return getApiResponse<Document[], unknown>(resp);
}

/**
 * Upload file data to a presigned_url on cloud storage.
 * Use this after running `create` to add documents to the database.
 * This function is a very thin wrapper around fetch.
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
 * Only errors are returned here. A null response means success.
 */
export async function process(
  documents: {
    id: string | number;
    force_ocr?: boolean;
    ocr_engine?: string;
  }[],
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<"OK", unknown>> {
  const endpoint = new URL("documents/process/", BASE_API_URL);

  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(documents),
  }).catch(console.error);

  return getApiResponse<null, unknown>(resp);
}

/**
 * Stop processing a document
 */
export async function cancel(
  document: Document,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<null, any>> {
  const processing: Set<Status> = new Set(["pending", "readable"]);

  // non-processing status is a no-op
  if (!processing.has(document.status)) return {};

  const endpoint = new URL(`documents/${document.id}/process/`, BASE_API_URL);

  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "DELETE",
    headers: {
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
  }).catch(console.error);

  return getApiResponse<null, any>(resp);
}

/**
 * Delete a document. There is no undo.
 */
export async function destroy(
  id: string | number,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<null, any>> {
  const endpoint = new URL(`documents/${id}/`, BASE_API_URL);

  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "DELETE",
    headers: {
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
  }).catch(console.error);

  return getApiResponse<null, any>(resp);
}

/**
 * Delete many documents. There is no undo.
 *
 * @param ids
 * @param csrf_token
 * @param fetch
 */
export async function destroy_many(
  ids: (string | number)[],
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<null, unknown>> {
  const endpoint = new URL(`documents/`, BASE_API_URL);
  endpoint.searchParams.set("id__in", ids.join(","));

  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "DELETE",
    headers: {
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
  }).catch(console.error);

  return getApiResponse<null, unknown>(resp);
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
): Promise<APIResponse<Document, ValidationError>> {
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

  return getApiResponse<Document, ValidationError>(resp);
}

/**
 * Bulk edit top-level fields of an array of documents.
 * Each document *must* have an `id` property.
 *
 * @param documents
 * @param csrf_token
 * @param fetch
 */
export async function edit_many(
  documents: Partial<Document>[],
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL("documents/", BASE_API_URL);

  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(documents),
  }).catch(console.error);

  return getApiResponse<DocumentResults>(resp);
}

/**
 * Add tags to a document.
 */
export async function add_tags(
  doc_id: number | string,
  key: string,
  values: string[],
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Data, any>> {
  const endpoint = new URL(`documents/${doc_id}/data/${key}/`, BASE_API_URL);
  const data: DataUpdate = { values };

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

  return getApiResponse<Data, any>(resp);
}

/**
 * Redact a document. This is a fire-and-forget operation, so we return the response directly.
 */
export async function redact(
  id: number | string,
  redactions: Redaction[],
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Response> {
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
 * Embed URL for a document, relative to the current server
 * This will be correct in all environments, including deploy previews
 * @export
 * @param {import('./types').Document} document
 * @param {URLSearchParams} params Optional embed parameters
 * @returns {URL}
 */
export function embedUrl(document: Document, params?: URLSearchParams): URL {
  const path = `/documents/${document.id}-${document.slug}/?embed=1`;
  const url = new URL(path, EMBED_URL);

  if (params) {
    const combined = new URLSearchParams([["embed", "1"], ...params]);
    url.search = combined.toString();
  }

  return url;
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
export function pageFromHash(hash: string): Nullable<number> {
  const re = /^#document\/p(\d+)/; // match pages and notes
  const match = re.exec(hash);

  if (!match) return null;

  return +match[1] || null;
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
    return `${getUserName(document.user)} (${document.organization.name})`;
  }

  // just a user
  if (typeof document.user === "object") {
    return getUserName(document.user);
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
