import type { Maybe, Nullable, User, Org } from "@/api/types";

import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  MAX_PER_PAGE,
  SQUARELET_BASE,
} from "@/config/config.js";
import { isErrorCode, getAll } from "../utils";

/** Get the logged-in user */
export async function getMe(fetch = globalThis.fetch): Promise<Maybe<User>> {
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

/**
 * Get a list or organizations a user belongs to
 *
 * @param user
 * @param fetch
 */
export async function userOrgs(
  user: User,
  fetch = globalThis.fetch,
): Promise<Org[]> {
  const endpoint = new URL("organizations/", BASE_API_URL);
  endpoint.searchParams.set("id__in", user.organizations.join(","));

  return getAll<Org>(endpoint, MAX_PER_PAGE, fetch);
}

/**
 * Get a list of users belonging to an organization, or an empty array
 * for individual orgs.
 *
 * @param org
 * @param fetch
 */
export async function orgUsers(
  org: Org,
  fetch = globalThis.fetch,
): Promise<User[]> {
  if (org.individual) return [];
  const endpoint = new URL("users/", BASE_API_URL);
  endpoint.searchParams.set("organization", String(org.id));

  return getAll<User>(endpoint, MAX_PER_PAGE, fetch);
}

export async function getOrg(
  id: number,
  fetch = globalThis.fetch,
): Promise<Org> {
  const endpoint = new URL(`organizations/${id}/`, BASE_API_URL);
  const resp = await fetch(endpoint, { credentials: "include" });
  return resp.json();
}

export async function setOrg(
  org: number,
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL("users/me/", BASE_API_URL);
  endpoint.searchParams.set("expand", "organization");

  const resp = await fetch(endpoint, {
    body: JSON.stringify({ organization: org }),
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      Referer: APP_URL,
      [CSRF_HEADER_NAME]: csrf_token,
    },
    method: "PATCH",
  }).catch(console.error);

  if (!resp) {
    throw new Error("API error");
  }

  if (isErrorCode(resp.status)) {
    console.error(await resp.json());
    throw new Error(resp.statusText);
  }

  return resp.json();
}

export function getUserName(user: User): string {
  return user.name ?? user.username;
}

export function getUpgradeUrl(org: Nullable<Org> = null): URL {
  if (!org || org.individual) {
    // Redirect the user to their Squarelet account settings
    return new URL("/users/~payment/", SQUARELET_BASE);
  }
  // Redirect the user to the Squarelet organization settings
  return new URL(`/organizations/${org.slug}/payment/`, SQUARELET_BASE);
}

export function isUser(user?: null | number | User): user is User {
  return user !== undefined && user !== null && typeof user !== "number";
}

export function isOrg(o?: null | number | Org): o is Org {
  if (o === null || o === undefined || typeof o === "number") return false;
  return true;
}

export function isPremiumOrg(org?: Nullable<Org>): boolean {
  if (!org || !org.plan) return false;
  return org.plan !== "Free";
}

export function getCreditBalance(org?: Nullable<Org>): Nullable<number> {
  if (!org) return null;
  return (org.monthly_credits ?? 0) + (org.purchased_credits ?? 0);
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
