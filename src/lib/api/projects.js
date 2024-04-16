// api methods for projects
import { error } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";

/**
 * Get a single project
 *
 * @export
 * @param {number} id
 * @param {globalThis.fetch} fetch
 * @returns {import('./types').Project}
 */
export async function get(id, fetch) {}

/**
 * Get a list of projects
 *
 * @export
 * @param {any} params filter params
 * @param {globalThis.fetch} fetch
 * @returns {Promise<import('./types').ProjectResults>}
 */
export async function list(params = {}, fetch) {
  const endpoint = new URL("projects/", BASE_API_URL);

  for (const [k, v] of Object.entries(params)) {
    endpoint.searchParams.set(k, v);
  }

  const res = await fetch(endpoint, { credentials: "include" }).catch((e) => ({
    ok: false,
    error: e,
  }));

  if (!res.ok) {
    error(res.status, {
      message: res.statusText,
      error: res.error,
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
 * @returns {import('./types').ProjectMembershipList}
 */
export async function documents(id, fetch) {
  const endpoint = new URL(`projects/${id}/documents/`, BASE_API_URL);
  const expand = ["user", "organization", "document"];

  // might make these configurable later
  endpoint.searchParams.set("expand", expand.join(","));
  endpoint.searchParams.set("ordering", "-created_at");
  endpoint.searchParams.set("per_page", 12);

  const res = await fetch(endpoint, { credentials: "include" }).catch((e) => ({
    ok: false,
    error: e,
  }));

  if (!res.ok) {
    error(res.status, {
      message: res.statusText,
      error: res.error,
    });
  }

  return res.json();
}
