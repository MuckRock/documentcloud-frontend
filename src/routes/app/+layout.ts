import { getPinnedAddons } from "@/lib/api/addons";

export async function load({ url, fetch }) {
  const pinnedAddons = getPinnedAddons(fetch);
  return {
    pinnedAddons,
  };
}
