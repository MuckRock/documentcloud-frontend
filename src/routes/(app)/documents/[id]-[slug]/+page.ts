import { getQuery } from "@/lib/utils/search.js";

export async function load({ url, data }) {
  const query = getQuery(url);

  return {
    ...(data ?? {}), // include csrf_token
    query,
  };
}
