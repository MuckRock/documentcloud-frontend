import type { Maybe, Nullable, User, Org, Page } from "$lib/api/types";
import type { APIResponse } from "./types";

import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  MAX_PER_PAGE,
  SQUARELET_BASE,
} from "@/config/config.js";
import { getAll, getApiResponse } from "../utils";
import { objectToSearchParams } from "../utils/search";

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

/**
 * @deprecated
 * @param id
 * @param fetch
 */
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
): Promise<APIResponse<User, unknown>> {
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
  }).catch(console.warn);

  return getApiResponse<User>(resp);
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

export function alphabetizeUsers(userA: User, userB: User) {
  const aName = getUserName(userA);
  const bName = getUserName(userB);
  return aName.localeCompare(bName);
}

export function inMyOrg(orgId: number, myId: number, users?: User[]) {
  // Sort by admin status, then username
  const adminUsers =
    users
      ?.filter((u) => u.admin_organizations?.includes(orgId))
      .sort(alphabetizeUsers) ?? [];
  const regularUsers =
    users?.filter((u) => !adminUsers.includes(u)).sort(alphabetizeUsers) ?? [];
  // Remove me from the user list
  return [...adminUsers, ...regularUsers].filter((u) => u.id !== myId);
}

export interface ListUsersParams
  extends Record<string, Maybe<string | number>> {
  name?: string;
  name__istartswith?: string;
  id__in?: string;
  username?: string;
  organization?: string;
  project?: string;
}

export async function listUsers(
  params: ListUsersParams,
  fetch = globalThis.fetch,
): Promise<APIResponse<Page<User>, unknown>> {
  const endpoint = new URL("users/", BASE_API_URL);
  const searchParams = objectToSearchParams(params);
  endpoint.search = searchParams.toString();
  const response = await fetch(endpoint, { credentials: "include" });
  return getApiResponse<Page<User>>(response);
}

export interface ListOrgsParams extends Record<string, Maybe<string>> {
  name?: string;
  name__istartswith?: string;
  id__in?: string;
}

export async function listOrgs(
  params: ListOrgsParams,
  fetch = globalThis.fetch,
): Promise<APIResponse<Page<Org>, unknown>> {
  const endpoint = new URL("organizations/", BASE_API_URL);
  const searchParams = objectToSearchParams(params);
  endpoint.search = searchParams.toString();
  endpoint.searchParams.set("individual", "false");
  const response = await fetch(endpoint, { credentials: "include" });
  return getApiResponse<Page<Org>>(response);
}
