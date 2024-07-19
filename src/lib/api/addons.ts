import type { Page } from "@/api/types/common";
import type { AddOnParams } from "@/api/types/addons";
import type { AddOnListItem, Event, Run, AddOnPayload } from "@/addons/types";
import { BASE_API_URL } from "@/config/config";
import { isErrorCode } from "../utils/api";

// todo i18n
export const CATEGORIES = [
  ["ai", "AI"],
  ["statistical", "Analyze"],
  ["bulk", "Bulk"],
  ["export", "Export"],
  ["extraction", "Extract"],
  ["file", "File"],
  ["monitor", "Monitor"],
];

export async function getAddons(
  params: AddOnParams = {},
  fetch = globalThis.fetch,
): Promise<Page<AddOnListItem>> {
  const endpoint = new URL("addons/", BASE_API_URL);
  Object.entries(params).forEach(([key, value]) => {
    endpoint.searchParams.set(key, String(value));
  });
  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.error,
  );

  if (!resp) {
    throw new Error("API error");
  }

  if (isErrorCode(resp.status)) {
    throw new Error(resp.statusText);
  }
  return resp.json();
}

export async function getPinnedAddons(
  fetch = globalThis.fetch,
): Promise<Page<AddOnListItem>> {
  return getAddons({ active: true }, fetch);
}

export async function getAddon(
  owner: string,
  repo: string,
  fetch = globalThis.fetch,
): Promise<AddOnListItem | null> {
  const repository = [owner, repo].join("/");
  const addons = await getAddons({ repository }, fetch);
  // there should only be one result, if the addon exists
  if (addons.results.length < 1) {
    return null;
  }
  return addons.results[0];
}

// dispatching

export async function dispatch() {}

export async function schedule() {}

export async function cancel() {}

export function buildPayload(addon: AddOnListItem, formData: FormData) {}

export function validatePayload(addon: AddOnListItem, payload: AddOnPayload) {}
