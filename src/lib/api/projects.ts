// api methods for projects
import type { Project, ProjectResults, ProjectMembershipList } from "./types";

import { error, type NumericRange } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";
import { isErrorCode } from "$lib/utils/isErrorCode";

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
 * Get a list of projects
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
