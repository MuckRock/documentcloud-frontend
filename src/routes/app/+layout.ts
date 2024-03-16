import { getPinnedAddons } from "@/lib/api/addons";

export async function load({ fetch }) {
  const pinnedAddons = getPinnedAddons(fetch);
  return {
    pinnedAddons,
    basement: null,
    basementComponent: null,
    modal: null,
  };
}
