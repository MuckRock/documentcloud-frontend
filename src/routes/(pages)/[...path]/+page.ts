// load data for flatpages
import { error } from "@sveltejs/kit";

import * as flatpages from "$lib/api/flatpages";

export async function load({ fetch, params }) {
  const { data, error: err } = await flatpages.get(params.path, fetch);

  if (!data) {
    return error(404, "Page not found");
  }

  if (err) {
    return error(err.status, { message: err.message });
  }

  return data;
}
