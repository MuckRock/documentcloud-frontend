// manage users in a project
import type { ProjectAccess, ProjectUser } from "./types";

import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
import { getAll, isErrorCode } from "$lib/utils/api";

export async function list(project_id: number, fetch = globalThis.fetch) {
  const endpoint = new URL(
    `projects/${project_id}/users/?expand=user`,
    BASE_API_URL,
  );

  return getAll<ProjectUser>(endpoint, undefined, fetch);
}

export async function add(
  project_id: number,
  user: { email: string; access: ProjectAccess },
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(`projects/${project_id}/users/`, BASE_API_URL);

  const resp = await fetch(endpoint, {
    body: JSON.stringify(user),
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "POST",
  }).catch(console.error);

  if (!resp) {
    throw new Error("API unavailable");
  }

  if (isErrorCode(resp.status)) {
    const data = await resp.json();
    console.error(data);
    throw new Error(resp.statusText);
  }

  return resp.json();
}

export async function update(
  project_id: number,
  user_id: number,
  access: ProjectAccess,
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(
    `projects/${project_id}/users/${user_id}/`,
    BASE_API_URL,
  );

  const resp = await fetch(endpoint, {
    body: JSON.stringify({ user: user_id, access }),
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "PATCH",
  }).catch(console.error);

  if (!resp) {
    throw new Error("API unavailable");
  }

  if (isErrorCode(resp.status)) {
    const data = await resp.json();
    console.error(data);
    throw new Error(resp.statusText);
  }

  return resp.json();
}

export async function remove(
  project_id: number,
  user_id: number,
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(
    `projects/${project_id}/users/${user_id}/`,
    BASE_API_URL,
  );

  return fetch(endpoint, {
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    method: "DELETE",
  });
}
