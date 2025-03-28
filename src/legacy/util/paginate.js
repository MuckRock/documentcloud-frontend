import session from "@/api/session";
import { queryBuilder } from "./url.js";

import { MAX_PER_PAGE } from "../../config/config.js";

/**
 * Requests the specified URL and paginates through to return all
 * results if additional pages are present.
 * @param {string} url The API url to request.
 * @param {number?} perPage If present, the per page to request
 */
export async function grabAllPages(url, perPage = MAX_PER_PAGE) {
  if (perPage) url = queryBuilder(url, { per_page: perPage });
  const { data } = await session.get(url);
  if (data.next) {
    // Grab the next page
    const next = await grabAllPages(data.next);
    return data.results.concat(next);
  } else {
    return data.results;
  }
}
