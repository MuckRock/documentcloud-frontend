import type { Page } from "@/api/types/common";
import type { AddOnListItem } from "@/addons/types";

import { error } from "@sveltejs/kit";

import { BASE_API_URL } from "@/config/config.js";
import { isErrorCode } from "../utils";

export async function getPinnedAddons(
  fetch = globalThis.fetch,
): Promise<Page<AddOnListItem>> {
  const endpoint = new URL(
    "/api/addons/?active=true&per_page=100",
    BASE_API_URL,
  );
  const resp = await fetch(endpoint, { credentials: "include" });
  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }
  return resp.json() as Promise<Page<AddOnListItem>>;
}

export async function getAddons(
  fetch = globalThis.fetch,
): Promise<Page<AddOnListItem>> {
  const endpoint = new URL("/api/addons/?per_page=100", BASE_API_URL);
  const resp = await fetch(endpoint, { credentials: "include" });
  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }
  return resp.json() as Promise<Page<AddOnListItem>>;
}
