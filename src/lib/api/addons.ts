import type { Page } from "@/api/types/common";
import type { AddOnParams } from "@/api/types/addons";
import type { AddOnListItem, Event, Run, AddOnPayload } from "@/addons/types";
import type { APIResponse, ValidationError } from "./types";

import Ajv, { type DefinedError } from "ajv";
import addFormats from "ajv-formats";
import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
import { getApiResponse, isErrorCode } from "../utils/api";

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

// schedules and eventValues are the inverse of each other, so store them together
export const schedules = ["disabled", "hourly", "daily", "weekly", "upload"];
export const eventValues = {
  disabled: 0,
  hourly: 1,
  daily: 2,
  weekly: 3,
  upload: 4,
};

/**
 * List add-ons, with optional filters
 */
export async function getAddons(
  params: AddOnParams = {},
  fetch = globalThis.fetch,
): Promise<APIResponse<Page<AddOnListItem>, unknown>> {
  const endpoint = new URL("addons/", BASE_API_URL);
  Object.entries(params).forEach(([key, value]) => {
    endpoint.searchParams.set(key, String(value));
  });
  const resp = await fetch(endpoint, { credentials: "include" });

  return getApiResponse<Page<AddOnListItem>>(resp);
}

/**
 * List pinned add-ons
 */
export async function getPinnedAddons(
  fetch = globalThis.fetch,
): Promise<APIResponse<Page<AddOnListItem>, unknown>> {
  return getAddons({ active: true }, fetch);
}

export async function getAddon(
  owner: string,
  repo: string,
  fetch = globalThis.fetch,
): Promise<AddOnListItem | null> {
  const repository = [owner, repo].join("/");
  const { data: addons, error } = await getAddons({ repository }, fetch);
  // there should only be one result, if the addon exists
  if (error || addons.results.length < 1) {
    return null;
  }
  return addons.results[0];
}

export async function getEvent(
  id: number,
  fetch = globalThis.fetch,
): Promise<APIResponse<Event, unknown>> {
  const endpoint = new URL(`addon_events/${id}/?expand=addon`, BASE_API_URL);

  const resp = await fetch(endpoint, { credentials: "include" });

  return getApiResponse<Event>(resp);
}

/**
 * List add-on runs
 */
export async function history(
  params: {
    cursor?: string;
    dismissed?: boolean;
    event?: number;
    per_page?: number;
    addon?: number;
  } = {},
  fetch = globalThis.fetch,
): Promise<APIResponse<Page<Run>, unknown>> {
  const endpoint = new URL("addon_runs/?expand=addon", BASE_API_URL);
  for (const [k, v] of Object.entries(params)) {
    endpoint.searchParams.set(k, String(v));
  }

  const resp = await fetch(endpoint, { credentials: "include" });

  return getApiResponse<Page<Run>>(resp);
}

/**
 * List scheduled add-on events
 */
export async function scheduled(
  params: { cursor?: string; addon?: number; per_page?: number } = {},
  fetch = globalThis.fetch,
): Promise<APIResponse<Page<Event>, unknown>> {
  const endpoint = new URL("addon_events/?expand=addon", BASE_API_URL);
  for (const [k, v] of Object.entries(params)) {
    endpoint.searchParams.set(k, String(v));
  }

  const resp = await fetch(endpoint, { credentials: "include" });

  return getApiResponse<Page<Event>>(resp);
}

// dispatching

/**
 * Create or schedule a single add-on run
 */
export async function dispatch(
  payload: AddOnPayload,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Event | Run, ValidationError>> {
  const path = payload.event ? "addon_events/" : "addon_runs/";
  const endpoint = new URL(path, BASE_API_URL);
  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(payload),
  });

  return getApiResponse<Run | Event, ValidationError>(resp);
}

/**
 * Update or cancel an add-on event
 */
export async function update(
  event_id: number,
  payload: AddOnPayload,
  csrf_token: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Event, ValidationError>> {
  const endpoint = new URL(`addon_events/${event_id}/`, BASE_API_URL);
  const resp = await fetch(endpoint, {
    credentials: "include",
    method: "PUT",
    headers: {
      "Content-type": "application/json",
      [CSRF_HEADER_NAME]: csrf_token,
      Referer: APP_URL,
    },
    body: JSON.stringify(payload),
  });

  return getApiResponse<Event, ValidationError>(resp);
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

  if (formData.has("event")) {
    payload.event = eventValues[formData.get("event") as string];
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

  payload.parameters = noNulls(payload.parameters);
  const valid = validator(payload.parameters);

  return { valid, errors: validator.errors };
}

function noNulls<T extends Record<string, any>>(values: T): Partial<T> {
  const nulls = new Set([null, undefined, ""]);
  return Object.entries(values).reduce((m, [k, v]) => {
    if (!nulls.has(v)) {
      m[k] = v;
    }
    return m;
  }, {});
}
