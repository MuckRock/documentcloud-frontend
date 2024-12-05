import type {
  APIResponse,
  Section,
  SectionResults,
  ValidationError,
} from "./types";

import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
import { getApiResponse } from "../utils";

/**
 * Load sections from a single document from the API
 * Example: https://api.www.documentcloud.org/api/documents/24028981/sections/
 *
 * @deprecated
 */
export async function list(
  doc_id: string | number,
  fetch = globalThis.fetch,
): Promise<SectionResults> {
  const endpoint = new URL(`documents/${doc_id}/sections.json`, BASE_API_URL);

  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.warn,
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
 * @deprecated
 */
export async function get(
  doc_id: string | number,
  section_id: number,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(
    `documents/${doc_id}/sections/${section_id}.json`,
    BASE_API_URL,
  );

  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.warn,
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
 */
export async function create(
  doc_id: string | number,
  section: { page_number: number; title: string },
  csrf_token: string | undefined,
  fetch = globalThis.fetch,
): Promise<APIResponse<Section, ValidationError>> {
  const endpoint = new URL(`documents/${doc_id}/sections/`, BASE_API_URL);

  if (!csrf_token) {
    return Promise.reject({
      error: { status: 403, message: "CSRF token required" },
    });
  }

  const resp = await fetch(endpoint, {
    credentials: "include",
    body: JSON.stringify(section),
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "POST",
  });

  return getApiResponse<Section, ValidationError>(resp);
}

/**
 * Update a section on a document
 */
export async function update(
  doc_id: string | number,
  section_id: string | number,
  section: { page_number?: number; title?: string },
  csrf_token: string | undefined,
  fetch = globalThis.fetch,
): Promise<APIResponse<Section, ValidationError>> {
  const endpoint = new URL(
    `documents/${doc_id}/sections/${section_id}/`,
    BASE_API_URL,
  );

  if (!csrf_token) {
    return Promise.reject({
      error: { status: 403, message: "CSRF token required" },
    });
  }

  const resp = await fetch(endpoint, {
    credentials: "include",
    body: JSON.stringify(section),
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "PATCH",
  });

  return getApiResponse<Section, ValidationError>(resp);
}

/**
 * Delete a section from a document.
 */
export async function remove(
  doc_id: string | number,
  section_id: string | number,
  csrf_token: string | undefined,
  fetch = globalThis.fetch,
): Promise<APIResponse<null, unknown>> {
  const endpoint = new URL(
    `documents/${doc_id}/sections/${section_id}/`,
    BASE_API_URL,
  );

  if (!csrf_token) {
    return Promise.reject({
      error: { status: 403, message: "CSRF token required" },
    });
  }

  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
  });

  return getApiResponse<null>(resp);
}
