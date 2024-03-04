import { getAddons } from "@/lib/api/addons";

export async function load({ fetch }) {
  const addons = getAddons(fetch);
  return {
    addons,
  };
}
