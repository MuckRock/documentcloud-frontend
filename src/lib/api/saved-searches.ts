// API methods for saved searches
import type { APIResponse, SavedSearch, SavedSearchResults } from "./types";

import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
import { getAll, getApiResponse } from "$lib/utils/api";

const ENDPOINT = "documents/search/saved/";

function mutationHeaders(csrf_token: string) {
  return {
    "Content-type": "application/json",
    [CSRF_HEADER_NAME]: csrf_token,
    Referer: APP_URL,
  };
}

/**
 * List all saved searches for the current user.
 */
export async function list(
  fetch = globalThis.fetch,
): Promise<APIResponse<SavedSearchResults, unknown>> {
  const endpoint = new URL(ENDPOINT, BASE_API_URL);
  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.warn,
  );
  return getApiResponse<SavedSearchResults>(resp);
}

/**
 * List all saved searches for the current user (follows pagination).
 */
export async function listAll(
  fetch = globalThis.fetch,
): Promise<SavedSearch[]> {
  const endpoint = new URL(ENDPOINT, BASE_API_URL);
  return getAll<SavedSearch>(endpoint, undefined, fetch);
}

/**
 * Create a new saved search.
 */
export async function create(
  data: { name: string; query: string },
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<SavedSearch, unknown>> {
  const endpoint = new URL(ENDPOINT, BASE_API_URL);
  const resp = await fetch(endpoint, {
    body: JSON.stringify(data),
    credentials: "include",
    headers: mutationHeaders(csrf_token),
    method: "POST",
  }).catch(console.warn);
  return getApiResponse<SavedSearch>(resp);
}

/**
 * Update a saved search by UUID.
 */
export async function update(
  uuid: string,
  data: Partial<{ name: string; query: string }>,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<SavedSearch, unknown>> {
  const endpoint = new URL(`${ENDPOINT}${uuid}/`, BASE_API_URL);
  const resp = await fetch(endpoint, {
    body: JSON.stringify(data),
    credentials: "include",
    headers: mutationHeaders(csrf_token),
    method: "PATCH",
  }).catch(console.warn);
  return getApiResponse<SavedSearch>(resp);
}

/**
 * Delete a saved search by UUID.
 */
export async function destroy(
  uuid: string,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<null, unknown>> {
  const endpoint = new URL(`${ENDPOINT}${uuid}/`, BASE_API_URL);
  const resp = await fetch(endpoint, {
    credentials: "include",
    headers: mutationHeaders(csrf_token),
    method: "DELETE",
  }).catch(console.warn);
  return getApiResponse<null>(resp);
}
