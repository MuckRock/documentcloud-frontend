/* Methods to operate on a single document's KV data */

import type {
  APIResponse,
  Data,
  Document,
  Maybe,
  ValidationError,
} from "./types";

import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
import { getApiResponse } from "$lib/utils";

interface DataPayload {
  values?: string[];
  remove?: string[];
}

/**
 * Fetch the value of a single key
 * GET /api/documents/<document_id>/data/<key>/
 */
export async function get(
  document: Document,
  key: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<string[]>> {
  const endpoint = new URL(
    `documents/${document.id}/data/${key}/`,
    BASE_API_URL,
  );

  const response = await fetch(endpoint, { credentials: "include" }).catch(
    console.warn,
  );

  return getApiResponse<string[]>(response);
}

/**
 * Set values for a key, overwriting any existing keys
 * PUT /api/documents/<document_id>/data/<key>/
 */
export async function set(
  document: Document,
  key: string,
  values: string[],
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Data, ValidationError>> {
  const endpoint = new URL(
    `documents/${document.id}/data/${key}/`,
    BASE_API_URL,
  );

  const body: DataPayload = { values };

  const response = await fetch(endpoint, {
    credentials: "include",
    method: "PUT",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(body),
  }).catch(console.warn);

  return getApiResponse<Data, ValidationError>(response);
}

/**
 * Update or remove values for a key
 * PATCH /api/documents/<document_id>/data/<key>/
 */
export async function update(
  document: Document,
  key: string,
  values: Maybe<string[]> = undefined,
  remove: Maybe<string[]> = undefined,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Data, ValidationError>> {
  const endpoint = new URL(
    `documents/${document.id}/data/${key}/`,
    BASE_API_URL,
  );

  const body: DataPayload = {};

  if (values && values.length) {
    body.values = values;
  }

  if (remove && remove.length > 0) {
    body.remove = remove;
  }

  const response = await fetch(endpoint, {
    credentials: "include",
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(body),
  }).catch(console.warn);

  return getApiResponse<Data, ValidationError>(response);
}
