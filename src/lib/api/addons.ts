import type { Page } from "@/api/types/common";
import type { AddOnParams } from "@/api/types/addons";
import type { AddOnListItem, Event, Run, AddOnPayload } from "@/addons/types";

import Ajv, { type DefinedError } from "ajv";
import addFormats from "ajv-formats";
import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
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

/**
 * List add-on runs
 */
export async function history(
  params: { cursor?: string; dismissed?: boolean; event?: number } = {},
  fetch = globalThis.fetch,
): Promise<Page<Run>> {
  const endpoint = new URL("addon_runs/?expand=addon", BASE_API_URL);
  for (const [k, v] of Object.entries(params)) {
    endpoint.searchParams.set(k, String(v));
  }

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

/**
 * List scheduled add-on events
 */
export async function scheduled(
  params: { cursor?: string; addon?: number } = {},
  fetch = globalThis.fetch,
): Promise<Page<Event>> {
  const endpoint = new URL("addon_events/?expand=addon", BASE_API_URL);
  for (const [k, v] of Object.entries(params)) {
    endpoint.searchParams.set(k, String(v));
  }

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

// dispatching

/**
 * Create or schedule a single add-on run, returning the HTTP response
 */
export async function dispatch(
  payload: AddOnPayload,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<Response> {
  const path = payload.event ? "addon_events/" : "addon_runs/";
  const endpoint = new URL(path, BASE_API_URL);
  return fetch(endpoint, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Update or cancel an add-on event
 */
export async function update(
  event: Event,
  payload: AddOnPayload,
  csrf_token: string,
  fetch = globalThis.fetch,
) {
  const endpoint = new URL(`addon_events/${event.id}/`, BASE_API_URL);
  return fetch(endpoint, {
    credentials: "include",
    method: "PUT",
    headers: { "X-CSRFToken": csrf_token, "Content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * Build a payload to dispatch or schedule an add-on run.
 * Note that this may not give all the correct types,
 * because FormData makes everything a string.
 *
 * Pass results to `validatePayload` to ensure correctness.
 */
export function buildPayload(
  addon: AddOnListItem,
  formData: FormData,
  validate = false,
): AddOnPayload {
  const parameters = {};

  for (const [field, params] of Object.entries(
    addon.parameters?.properties ?? {},
  )) {
    const value =
      params.type === "array" ? formData.getAll(field) : formData.get(field);

    parameters[field] = value;
  }

  const payload: AddOnPayload = { addon: addon.id, parameters };

  const selection = formData.get("selection");

  if (selection === "selected") {
    payload.documents = formData
      .get("documents")
      .toString()
      .split(",")
      .map(Number);
  }

  if (selection === "query") {
    payload.query = formData.get("query").toString();
  }

  if (validate) {
    const { valid, errors } = validatePayload(addon, payload);
    payload.valid = valid;
    payload.errors = errors as DefinedError[];
  }

  return payload;
}

function validatePayload(addon: AddOnListItem, payload: AddOnPayload) {
  // todo: investigate whether there's any benefit to creating a global ajv instance
  const ajv = new Ajv({ coerceTypes: true, useDefaults: true });
  addFormats(ajv);

  const { properties, required } = addon.parameters;
  const validator = ajv.compile({ type: "object", properties, required });

  const valid = validator(payload.parameters);

  return { valid, errors: validator.errors };
}
