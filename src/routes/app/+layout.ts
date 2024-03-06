import { getPinnedAddons } from "@/lib/api/addons";

export async function load({ url, fetch }) {
  const { pathname } = url;
  console.log(pathname);
  const pinnedAddons = getPinnedAddons(fetch);
  const isAddOnRoute = pathname.match(/\/app\/add-ons\/?/);
  const isProjectRoute = pathname.match(/\/app\/projects\/?/);
  const basement = isAddOnRoute ? "right" : isProjectRoute ? "left" : null;
  return {
    pinnedAddons,
    isAddOnRoute,
    isProjectRoute,
    basement,
  };
}
