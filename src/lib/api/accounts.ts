import type { Maybe, User, Org } from "@/api/types";
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

export function isPremiumOrg(org: Org): Boolean {
  if (!org || !org.plan) return null;
  return org.plan !== "Free";
}

export function getCreditBalance(org: Org): Number {
  if (!org) return null;
  return org.monthly_credits + org.purchased_credits;
}
