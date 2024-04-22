import { getAddons } from "@/lib/api/addons.js";

export async function load({ url, fetch }) {
  const params = Object.fromEntries(url.searchParams.entries());
  const addons = getAddons(params, fetch);
  return {
    addons,
  };
}
