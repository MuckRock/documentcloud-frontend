// load data for flatpages
import { error } from "@sveltejs/kit";

import { PAGE_MAX_AGE } from "@/config/config.js";
import * as flatpages from "$lib/api/flatpages";

export async function load({ fetch, params, setHeaders }) {
  const { data, error: err } = await flatpages.get(params.path, fetch);

  if (err) {
    return error(err.status, { message: err.message });
  }

  if (!data) {
    return error(404, "Page not found");
  }

  setHeaders({
    "cache-control": `public, max-age=${PAGE_MAX_AGE}`,
  });

  return data;
}
