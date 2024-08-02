import type { Maybe, Nullable, User, Org } from "@/api/types";
import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  SQUARELET_BASE,
} from "@/config/config.js";

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

export function isPremiumOrg(org: Org): boolean {
  if (!org || !org.plan) return false;
  return org.plan !== "Free";
}

export function getCreditBalance(org: Org): number | null {
  if (!org) return null;
  return org.monthly_credits + org.purchased_credits;
}

export async function createMailkey(
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Nullable<string>> {
  const endpoint = new URL(`users/mailkey/`, BASE_API_URL);
  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-type": "application/json",
        Referer: APP_URL,
        [CSRF_HEADER_NAME]: csrf_token,
      },
    });
    const data = await resp.json();
    return data.mailkey;
  } catch (e) {
    return null;
  }
}

export async function destroyMailkey(
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<boolean> {
  const endpoint = new URL(`users/mailkey/`, BASE_API_URL);
  try {
    const resp = await fetch(endpoint, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-type": "application/json",
        Referer: APP_URL,
        [CSRF_HEADER_NAME]: csrf_token,
      },
    });
    if (!resp.ok) throw new Error(resp.statusText);
    return true;
  } catch (e) {
    return false;
  }
}
