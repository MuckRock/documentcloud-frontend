import type { Maybe, Nullable, User, Org } from "@/api/types";
import { BASE_API_URL, SQUARELET_BASE } from "@/config/config.js";

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

export function getUpgradeUrl(org: Org = null): URL {
  if (!org || org.individual) {
    // Redirect the user to their Squarelet account settings
    return new URL("/users/~payment/", SQUARELET_BASE);
  }
  // Redirect the user to the Squarelet organization settings
  return new URL(`/organizations/${org.slug}/payment/`, SQUARELET_BASE);
}

export async function createMailkey(fetch: Fetch): Promise<Nullable<string>> {
  const endpoint = new URL(`users/mailkey/`, BASE_API_URL);
  try {
    const resp = await fetch(endpoint, { method: "POST", credentials: "include" });
    const data = await resp.json();
    return data.mailkey;
  } catch (e) {
    return null;
  }
}

export async function destroyMailkey(fetch: Fetch): Promise<boolean> {
  const endpoint = new URL(`users/mailkey/`, BASE_API_URL);
  try {
    const resp = await fetch(endpoint, { method: "DELETE", credentials: "include" });
    if (!resp.ok) throw new Error();
    return true;
  } catch (e) {
    return false;
  }
}
