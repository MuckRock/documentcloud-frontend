// api methods for projects
import type { Project, ProjectResults, ProjectMembershipList } from "./types";

import { error, type NumericRange } from "@sveltejs/kit";

import { BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
import { getAll, isErrorCode } from "$lib/utils/api";

/**
 * Get a single project
 *
 * @export
 * @param {number} id
 * @param {globalThis.fetch} fetch
 * @returns {Promise<import('./types').Project>}
 */
export async function get(
  id: number,
  fetch = globalThis.fetch,
): Promise<Project> {
  const endpoint = new URL(`projects/${id}/`, BASE_API_URL);

  const res = await fetch(endpoint, { credentials: "include" }).catch((e) => {
    error(500, { message: e });
  });

  if (isErrorCode(res.status)) {
    error(res.status, {
      message: res.statusText,
    });
  }

  return res.json();
}

/**
 * Get a page of projects
 *
 * @export
 * @param {any} params filter params
 * @param {globalThis.fetch} fetch
 */
export async function list(
  params: any = {},
  fetch = globalThis.fetch,
): Promise<ProjectResults> {
  const endpoint = new URL("projects/", BASE_API_URL);

  for (const [k, v] of Object.entries(params)) {
    endpoint.searchParams.set(k, String(v));
  }

  const res = await fetch(endpoint, { credentials: "include" }).catch((e) => {
    error(500, { message: e });
  });

  if (isErrorCode(res.status)) {
    error(res.status, {
      message: res.statusText,
    });
  }

  return res.json();
}

/**
 * Get a list of all projects owned by the user
 */
export async function getOwned(
  userId: number,
  query?: string,
): Promise<Project[]> {
  const endpoint = new URL("projects/", BASE_API_URL);
  endpoint.searchParams.set("user", String(userId));
  endpoint.searchParams.set("query", query);
  const projects = await getAll<Project>(endpoint);
  return projects.filter((project) => project.user === userId);
}

/**
 * Get a list of all projects shared with the user
 */
export async function getShared(
  userId: number,
  query?: string,
): Promise<Project[]> {
  const endpoint = new URL("projects/", BASE_API_URL);
  endpoint.searchParams.set("user", String(userId));
  endpoint.searchParams.set("query", query);
  const projects = await getAll<Project>(endpoint);
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
): Promise<Project> {
  const endpoint = new URL(`/api/projects/${id}/`, BASE_API_URL);
  const options: RequestInit = {
    credentials: "include",
    method: "PATCH", // this component can only update whether a project is pinned
    headers: {
      [CSRF_HEADER_NAME]: csrftoken,
      "Content-type": "application/json",
    },
  };

  // The endpoint returns the updated project
  const res = await fetch(endpoint, {
    ...options,
    body: JSON.stringify({ pinned }),
  });
  if (isErrorCode(res.status)) {
    error(res.status, {
      message: res.statusText,
    });
  }
  return res.json();
}

/**
 * Get documents in a project with membership access
 *
 * @export
 * @param {number} id
 * @param {globalThis.fetch} fetch
 */
export async function documents(
  id: number | string,
  fetch = globalThis.fetch,
): Promise<ProjectMembershipList> {
  const endpoint = new URL(`projects/${id}/documents/`, BASE_API_URL);
  const expand = ["user", "organization", "document"];

  // might make these configurable later
  endpoint.searchParams.set("expand", expand.join(","));
  endpoint.searchParams.set("ordering", "-created_at");
  endpoint.searchParams.set("per_page", "12");

  const res = await fetch(endpoint, { credentials: "include" }).catch((e) => {
    error(500, { message: e });
  });

  if (isErrorCode(res.status)) {
    error(res.status, {
      message: res.statusText,
    });
  }

  return res.json();
}
