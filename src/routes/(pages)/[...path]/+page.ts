// load data for flatpages
import { error } from "@sveltejs/kit";
import { BASE_API_URL } from "@/config/config.js";

import * as flatpages from "$lib/api/flatpages";

export async function load({ fetch, params }) {
  const { data, error: err } = await flatpages.get(params.path, fetch);

  if (err) {
    return error(err.status, { message: err.message });
  }

  return data;
}
