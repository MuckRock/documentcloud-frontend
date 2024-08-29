// api methods for projects
import type { Page } from "@/api/types";
import type { Project, ProjectResults, Document } from "./types";

import { BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
import { getAll, isErrorCode } from "$lib/utils/api";

/**
 * Get a single project
 *
 * @export
 */
export async function get(
  id: number,
  fetch = globalThis.fetch,
): Promise<Project> {
  const endpoint = new URL(`projects/${id}/`, BASE_API_URL);

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

/**
 * Get a page of projects
 *
 * @export
 */
export async function list(
  params: Record<string, any> = {},
  fetch = globalThis.fetch,
): Promise<ProjectResults> {
  const endpoint = new URL("projects/", BASE_API_URL);

  for (const [k, v] of Object.entries(params)) {
    endpoint.searchParams.set(k, String(v));
  }

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

/**
 * Get a list of all projects owned by the user
 */
export async function getOwned(
  userId: number,
  query?: string,
  fetch = globalThis.fetch,
): Promise<Project[]> {
  const endpoint = new URL("projects/", BASE_API_URL);
  endpoint.searchParams.set("user", String(userId));
  if (query) {
    endpoint.searchParams.set("query", query);
  }
  const projects = await getAll<Project>(endpoint, undefined, fetch);
  return projects.filter((project) => project.user === userId);
}

/**
 * Get a list of all projects shared with the user
 */
export async function getShared(
  userId: number,
  query?: string,
  fetch = globalThis.fetch,
): Promise<Project[]> {
  const endpoint = new URL("projects/", BASE_API_URL);
  endpoint.searchParams.set("user", String(userId));
  if (query) {
    endpoint.searchParams.set("query", query);
  }
  const projects = await getAll<Project>(endpoint, undefined, fetch);
  return projects.filter((project) => project.user !== userId);
}

/**
 * Set the pinned status of a project.
 * When requesting PATCH on the project endpoint,
 * it returns the updated project object.
 */
export async function pinProject(
  csrftoken: string,
  id: number,
  pinned = true,
  fetch = globalThis.fetch,
): Promise<Project> {
  const endpoint = new URL(`projects/${id}/`, BASE_API_URL);
  const options: RequestInit = {
    credentials: "include",
    method: "PATCH", // this component can only update whether a project is pinned
    headers: {
      [CSRF_HEADER_NAME]: csrftoken,
      "Content-type": "application/json",
    },
  };

  // The endpoint returns the updated project
  const resp = await fetch(endpoint, {
    ...options,
    body: JSON.stringify({ pinned }),
  }).catch(console.error);

  if (!resp) {
    throw new Error("API error");
  }

  if (isErrorCode(resp.status)) {
    throw new Error(resp.statusText);
  }
  return resp.json();
}

/**
 * Get documents in a project with membership access
 *
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
