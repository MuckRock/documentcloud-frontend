import type { Page } from "@/api/types/common";
import type { AddOnParams } from "@/api/types/addons";
import type { AddOnListItem } from "@/addons/types";
import { BASE_API_URL } from "@/config/config";
import { isErrorCode } from "../utils/api";
import { error } from "@sveltejs/kit";

export const CATEGORIES = [
  ["export", "Export"],
  ["ai", "AI"],
  ["bulk", "Bulk"],
  ["extraction", "Extraction"],
  ["file", "File"],
  ["monitor", "Monitor"],
  ["statistical", "Statistical"],
];

export async function getAddons(
  fetch = globalThis.fetch,
  params: AddOnParams = {},
): Promise<Page<AddOnListItem>> {
  const endpoint = new URL("/addons", BASE_API_URL);
  Object.entries(params).forEach(([key, value]) => {
    endpoint.searchParams.set(key, String(value));
  });
  const resp = await fetch(endpoint, { credentials: "include" });
  if (isErrorCode(resp.status)) {
    error(resp.status, resp.statusText);
  }
  return resp.json();
}

export async function getPinnedAddons(
  fetch = globalThis.fetch,
): Promise<Page<AddOnListItem>> {
  return getAddons(fetch, { active: true });
}
