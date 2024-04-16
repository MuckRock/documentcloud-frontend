import type { Maybe, User, Org } from "@/api/types";
import type { Access } from "./types";
import { BASE_API_URL } from "@/config/config.js";
import { slugify } from "@/util/string.js";

type Fetch = typeof globalThis.fetch;

/** Get the logged-in user */
export async function getMe(fetch: Fetch): Promise<Maybe<User>> {
  const endpoint = new URL("users/me/", BASE_API_URL);
  endpoint.searchParams.set("expand", "organization");
  try {
    const resp = await fetch(endpoint, { credentials: "include" });
    if (!resp.ok) return;
    return resp.json();
  } catch (e) {
    return;
  }
}

export async function getOrg(fetch: Fetch, id: number): Promise<Org> {
  const endpoint = new URL(`organizations/${id}/`, BASE_API_URL);
  const resp = await fetch(endpoint, { credentials: "include" });
  return resp.json();
}

// link helpers

/**
 * Generate search params for a user's documents
 * @param user
 * @param access
 */
export function userDocs(user: User, access: Access): string {
  return `+user:${slugify(user.name)}-${user.id} access:${access}`;
}
