import { error } from "@sveltejs/kit";

import { PAGE_MAX_AGE } from "@/config/config.js";
import * as flatpages from "$lib/api/flatpages";

export const trailingSlash = "always";

const path = "/about/";

export async function load({ fetch, setHeaders }) {
  const { data, error: err } = await flatpages.get(path, fetch);

  if (err) {
    return error(err.status, { message: err.message });
  }

  if (!data) {
    return error(404, "Page not found");
  }

  setHeaders({
    "Cloudflare-CDN-Cache-Control": `public, max-age=${PAGE_MAX_AGE}`,
  });

  return data;
}
