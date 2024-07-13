import type { Section, SectionResults } from "./types";

import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";

/**
 * Load sections from a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/24028981/sections/
 *
 * @async
 * @export
 */
export async function list(
  doc_id: string | number,
  fetch = globalThis.fetch,
): Promise<SectionResults> {
  const endpoint = new URL(`documents/${doc_id}/sections.json`, BASE_API_URL);

  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.error,
  );

  if (!resp) {
    throw new Error("API error");
  }

  if (!resp.ok) {
    throw new Error(resp.statusText);
  }

  return resp.json();
}

/**
 * Load a single section from a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/24028981/sections/33933/
 *
 * @async
 * @export
 */
export async function get(
  doc_id: string | number,
  section_id: number,
  fetch = globalThis.fetch,
): Promise<Section> {
  const endpoint = new URL(
    `documents/${doc_id}/sections/${section_id}.json`,
    BASE_API_URL,
  );

  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.error,
  );

  if (!resp) {
    throw new Error("API error");
  }

  if (!resp.ok) {
    throw new Error(resp.statusText);
  }

  return resp.json();
}

// writing methods

/**
 * Add a section to a document
 *
 * @param doc_id Document ID
 * @param section data
 * @param csrf_token
 * @param fetch
 * @returns {Section}
 */
export async function create(
  doc_id: string | number,
  section: { page_number: number; title: string },
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Section> {
  const endpoint = new URL(`documents/${doc_id}/sections/`, BASE_API_URL);

  const resp = await fetch(endpoint, {
    credentials: "include",
    body: JSON.stringify(section),
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
 * Update a section on a document
 *
 * @param doc_id Document ID
 * @param section_id Section ID
 * @param section data
 * @param csrf_token
 * @param fetch
 * @returns {Section}
 */
export async function update(
  doc_id: string | number,
  section_id: string | number,
  section: { page_number?: number; title?: string },
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Section> {
  const endpoint = new URL(
    `documents/${doc_id}/sections/${section_id}/`,
    BASE_API_URL,
  );

  const resp = await fetch(endpoint, {
    credentials: "include",
    body: JSON.stringify(section),
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
 * Delete a section from a document.
 *
 * @param doc_id Document ID
 * @param section_id Section ID
 * @param csrf_token
 * @param fetch
 */
export async function remove(
  doc_id: string | number,
  section_id: string | number,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Response> {
  const endpoint = new URL(
    `documents/${doc_id}/sections/${section_id}/`,
    BASE_API_URL,
  );

  return fetch(endpoint, {
    credentials: "include",
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
  });
}
