// api methods for projects
import type { Page } from "@/api/types";
import type {
  APIResponse,
  Document,
  Project,
  ProjectMembershipItem,
  ProjectResults,
  ValidationError,
} from "./types";

import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  EMBED_URL,
} from "@/config/config.js";
import { getAll, getApiResponse, isErrorCode } from "$lib/utils/api";

/**
 * Get a single project
 */
export async function get(
  id: number,
  fetch = globalThis.fetch,
): Promise<APIResponse<Project, unknown>> {
  const endpoint = new URL(`projects/${id}/`, BASE_API_URL);

  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.error,
  );

  return getApiResponse<Project>(resp);
}

/**
 * Get a page of projects
 */
export async function list(
  params: Record<string, any> = {},
  fetch = globalThis.fetch,
): Promise<APIResponse<ProjectResults, unknown>> {
  const endpoint = new URL("projects/", BASE_API_URL);

  for (const [k, v] of Object.entries(params)) {
    endpoint.searchParams.set(k, String(v));
  }

  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.error,
  );

  return getApiResponse<ProjectResults>(resp);
}

/**
 * Get all projects a user has access to -- owned or shared
 */
export async function getForUser(
  userId: number,
  query?: string,
  fetch = globalThis.fetch,
): Promise<Project[]> {
  const endpoint = new URL("projects/", BASE_API_URL);
  endpoint.searchParams.set("user", String(userId));
  if (query) {
    endpoint.searchParams.set("query", query);
  }
  return getAll<Project>(endpoint, undefined, fetch);
}

/**
 * Get a list of all projects owned by the user
 * @deprecated
 */
export async function getOwned(
  userId: number,
  query?: string,
  fetch = globalThis.fetch,
): Promise<Project[]> {
  const projects = await getForUser(userId, query, fetch);
  return projects.filter((project) => project.user === userId);
}

/**
 * Get a list of all projects shared with the user
 * @deprecated
 */
export async function getShared(
  userId: number,
  query?: string,
  fetch = globalThis.fetch,
): Promise<Project[]> {
  const projects = await getForUser(userId, query, fetch);
  return projects.filter((project) => project.user !== userId);
}

/**
 * Set the pinned status of a project.
 * When requesting PATCH on the project endpoint,
 * it returns the updated project object.
 */
export async function pinProject(
  id: number,
  pinned = true,
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(`projects/${id}/`, BASE_API_URL);
  const options: RequestInit = {
    credentials: "include",
    method: "PATCH", // this component can only update whether a project is pinned
    headers: {
      [CSRF_HEADER_NAME]: csrf_token,
      "Content-type": "application/json",
    },
  };

  // The endpoint returns the updated project
  const resp = await fetch(endpoint, {
    ...options,
    body: JSON.stringify({ pinned }),
  }).catch(console.error);

  return getApiResponse<Project>(resp);
}

// writable methods

/**
 * Create a new project
 */
export async function create(
  project: {
    title: string;
    description?: string;
    private?: boolean;
    pinned?: boolean;
  },
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Project, ValidationError>> {
  const endpoint = new URL("projects/", BASE_API_URL);
  const resp = await fetch(endpoint, {
    body: JSON.stringify(project),
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "POST",
  }).catch(console.error);

  return getApiResponse<Project, ValidationError>(resp);
}

export async function edit(
  project_id: number,
  data: Partial<Project>,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Project, ValidationError>> {
  const endpoint = new URL(`projects/${project_id}/`, BASE_API_URL);

  const resp = await fetch(endpoint, {
    body: JSON.stringify(data),
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "PATCH",
  }).catch(console.error);

  return getApiResponse<Project, ValidationError>(resp);
}

/**
 * Delete a project. There is no undo.
 */
export async function destroy(
  project_id: number,
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(`projects/${project_id}/`, BASE_API_URL);

  const resp = await fetch(endpoint, {
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "DELETE",
  }).catch(console.error);

  return getApiResponse<null>(resp);
}

/**
 * Add documents to a project
 *
 * @param project_id
 * @param documents
 * @param csrf_token
 * @param fetch
 */
export async function add(
  project_id: number,
  documents: (string | number)[],
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<ProjectMembershipItem[], unknown>> {
  const endpoint = new URL(`projects/${project_id}/documents/`, BASE_API_URL);
  const data = documents.map((document) => ({ document }));
  const resp = await fetch(endpoint, {
    body: JSON.stringify(data),
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "POST",
  }).catch(console.error);

  return getApiResponse<ProjectMembershipItem[]>(resp);
}

/**
 * Remove documents from a project
 */
export async function remove(
  project_id: number,
  documents: (string | number)[],
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(`projects/${project_id}/documents/`, BASE_API_URL);
  endpoint.searchParams.set("document_id__in", documents.join(","));

  const resp = await fetch(endpoint, {
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "DELETE",
  }).catch(console.error);

  return getApiResponse<null>(resp);
}

/**
 * Get documents in a project with membership access
 *
 * @deprecated
 * @export
 */
export async function documents(
  id: number | string,
  fetch = globalThis.fetch,
): Promise<Page<{ document: Document; edit_access: boolean }>> {
  const endpoint = new URL(`projects/${id}/documents/`, BASE_API_URL);
  const expand = ["user", "organization", "document"];

  // might make these configurable later
  endpoint.searchParams.set("expand", expand.join(","));
  endpoint.searchParams.set("ordering", "-created_at");
  endpoint.searchParams.set("per_page", "12");

  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.error,
  );

  if (!resp) {
    throw new Error("API error");
  }

  if (isErrorCode(resp.status)) {
    throw new Error(resp.statusText);
  }

  return resp.json();
}

// utils

export function canonicalUrl(project: Project): URL {
  return new URL(`/projects/${project.id}-${project.slug}/`, APP_URL);
}

export function embedUrl(project: Project): URL {
  return new URL(`/projects/${project.id}-${project.slug}/?embed=1`, EMBED_URL);
}
