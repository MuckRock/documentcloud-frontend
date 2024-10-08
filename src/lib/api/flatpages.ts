import type { APIResponse, Flatpage } from "./types";

import { BASE_API_URL } from "@/config/config";
import { getApiResponse } from "$lib/utils/api";

/**
 * Return the tip of the day flatpage
 * @param fetch
 */
export async function getTipOfDay(
  fetch = globalThis.fetch,
): Promise<Flatpage | undefined> {
  const { data, error } = await get("/tipofday/", fetch);
  if (!error) {
    return data;
  }
}

/**
 * Get a single flat page
 * @param path
 * @param fetch
 */
export async function get(
  path: string,
  fetch = globalThis.fetch,
): Promise<APIResponse<Flatpage, unknown>> {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  const endpoint = new URL("flatpages" + path, BASE_API_URL);
  const resp = await fetch(endpoint, { credentials: "include" }).catch(
    console.error,
  );

  return getApiResponse<Flatpage>(resp);
}
