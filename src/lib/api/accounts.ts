import type { Maybe, User, Org } from "@/api/types";
import { BASE_API_URL } from "@/config/config.js";

type Fetch = typeof globalThis.fetch;

/** Get the logged-in user */
export async function getMe(fetch: Fetch): Promise<Maybe<User>> {
  const endpoint = new URL("users/me/", BASE_API_URL);
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
