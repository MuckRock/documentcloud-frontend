// load data for flatpages
import { redirect } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";
import { isRedirectCode } from "@/lib/utils/api";
import { getApiResponse } from "$lib/utils/api";
import type { Flatpage } from "@/lib/api/types.js";

const ROOT = new URL("flatpages/", BASE_API_URL);

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
  const endpoint = new URL(params.path, ROOT);
  const resp = await fetch(endpoint, { credentials: "include" });
  // we should be following redirects, so this shouldn't happen
  if (isRedirectCode(resp.status)) {
    redirect(resp.status, resp.headers.get("Location"));
  }
  return getApiResponse<Flatpage>(resp);
}
