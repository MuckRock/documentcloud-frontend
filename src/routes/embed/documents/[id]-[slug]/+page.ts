import { getQuery } from "@/lib/utils/search.js";

/** @type {import('./$types').PageLoad} */
export async function load({ url }) {
  const query = getQuery(url);

  return {
    query,
  };
}
