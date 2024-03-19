/** API helpers related to documents.
 * Lots of duplicated code here that should get consolidated at some point.
 */
import { error } from "@sveltejs/kit";
import { APP_URL, BASE_API_URL } from "@/config/config.js";
import { DEFAULT_EXPAND } from "@/api/common.js";
import { isOrg } from "@/api/types/orgAndUser";
import { isErrorCode } from "../utils";

/** Search documents */
export async function search(
  query = "",
  highlight = false,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL("documents/search/", BASE_API_URL);

  endpoint.searchParams.set("expand", DEFAULT_EXPAND);
  endpoint.searchParams.set("q", query);
  endpoint.searchParams.set("hl", String(highlight));

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
  const expand = ["user", "organization", "projects", "revisions"];
  endpoint.searchParams.set("expand", expand.join(","));

  const resp = await fetch(endpoint, { credentials: "include" });

  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
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
  documents: Document[],
  fetch = globalThis.fetch,
): Promise<Document[]> {
  const endpoint = new URL("documents/", BASE_API_URL);

  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(documents),
  });

  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }

  return resp.json() as Promise<Document[]>;
}

/**
 * Upload file data to a presigned_url array.
 * Use this after running `create` to add documents to the database.
 *
 * Note that this function takes an array of objects containing a document ID and
 * a presigned URL, plus an array file data.
 *
 * @async
 * @export
 */
export async function upload(
  documents: { id: number; presigned_url: URL }[],
  files: File[] | FileList,
  fetch = globalThis.fetch,
): Promise<Response[]> {
  if (!(documents.length === files.length)) {
    throw new Error("mismatched number of documents and files");
  }
  return Promise.all(
    documents.map(({ id, presigned_url }, i) => {
      const file = files[i];

      return fetch(presigned_url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });
    }),
  );
}

/**
 * Extract images and text from uploaded documents
 *
 * @async
 * @export
 */
export async function process(
  documents: { id: number; force_ocr: boolean }[],
  fetch = globalThis.fetch,
): Promise<Response> {
  const endpoint = new URL("document/process/", BASE_API_URL);

  return fetch(endpoint, {
    credentials: "include",
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(documents),
  });
}

/**
 * Stop processing a document
 *
 * @param id Document ID
 */
export async function cancel(id: number) {}

// utility functions

/**
 * Canonical URL for a document, relative to the current server
 * This will be correct in all environments, including deploy previews
 *
 * @export
 * @param {import('./types').Document} document
 * @returns {URL}
 */
export function canonicalUrl(document) {
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
export function canonicalPageUrl(document, page) {
  return new URL(`/documents/${document.id}/pages/${page}/`, APP_URL);
}

/**
 * Generate the hash for a path, without the host or path
 *
 * @export
 * @param {number} page
 * @returns {URL}
 */
export function pageHashUrl(page) {
  return `#document/p${page}`;
}

/**
 * Hash URL for a single page within the document viewer
 *
 * @export
 * @param {import('./types').Document} document
 * @param {number} page
 * @returns {URL}
 */
export function pageUrl(document, page) {
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
export function pageImageUrl(document, page, size) {
  return new URL(
    `documents/${document.id}/pages/${document.slug}-p${page}-${size}.gif`,
    document.asset_url,
  );
}

/**
 * Asset URL for page text
 *
 * @export
 * @param {import('./types').Document} document
 * @param {number} page
 * @returns {URL}
 */
export function textUrl(document, page) {
  return new URL(
    `documents/${document.id}/pages/${document.slug}-p${page}.txt`,
    document.asset_url,
  );
}

/**
 * Asset URL for JSON text
 *
 * @export
 * @param {import('./types').Document} document
 * @returns {URL}
 */
export function jsonUrl(document) {
  return new URL(
    `documents/${document.id}/${document.slug}.txt.json`,
    document.asset_url,
  );
}

/**
 * Asset URL for text positions
 *
 * @export
 * @param {import('./types').Document} document
 * @param {number} page
 * @returns {URL}
 */
export function selectableTextUrl(document, page) {
  return new URL(
    `documents/${document.id}/pages/${document.slug}-p${page}.position.json`,
    document.asset_url,
  );
}

/**
 * Generate a user (organization) string
 *
 * @export
 * @param {import('./types').Document} document
 * @returns {string}
 */
export function userOrgString(document) {
  // we have an org and user
  if (isOrg(document.organization) && typeof document.user === "object") {
    return `${document.user.name} (${document.organization.name})`;
  }

  // just a user
  if (typeof document.user === "object") {
    return document.user;
  }

  // nothing, so return nothing
  return "";
}
