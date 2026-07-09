import type {
  AddOn,
  APIResponse,
  Maybe,
  Nullable,
  Org,
  Page,
  Project,
  User,
} from "$lib/api/types";

import { getMe, orgUsers, userOrgs } from "$lib/api/accounts";
import { getTipOfDay } from "$lib/api/flatpages";
import { getPinnedAddons } from "$lib/api/addons";
import { getPinnedProjects } from "$lib/api/projects";

export const trailingSlash = "always";

export async function load({ fetch, cookies }) {
  let me: Maybe<User>, org: Maybe<Org>;

  const sessionId = cookies.get("sessionid");

  // only get user data if we have an existing cookie
  if (sessionId) {
    me = await getMe(fetch);
    org = me?.organization as Org;
  }

  const tipOfDay = me ? await getTipOfDay(fetch) : null;

  let user_orgs: Promise<Org[]> = Promise.resolve([]);
  let org_users: Promise<User[]> = Promise.resolve([]);
  let pinnedAddons: Promise<Nullable<APIResponse<Page<AddOn>>>> =
    Promise.resolve(null);
  let pinnedProjects: Promise<Project[]> = Promise.resolve([]);

  if (me && org) {
    user_orgs = userOrgs(me, fetch).catch((e) => {
      console.error(e);
      return [];
    });
    org_users = orgUsers(org, fetch).catch((e) => {
      console.error(e);
      return [];
    });
  }

  if (me) {
    pinnedAddons = getPinnedAddons(fetch).catch((e) => {
      console.error(e);
      return null;
    });
    pinnedProjects = getPinnedProjects(fetch).catch((e) => {
      console.error(e);
      return [];
    });
  }

  // Await this data instead of returning the promises directly. Returning
  // unresolved promises from a layout `load` makes SvelteKit stream the
  // response, and once streaming begins the HTTP status is locked at 200 —
  // even when a child page's `load` throws (e.g. a 404 for a missing
  // document). Awaiting keeps the sidebar requests running in parallel while
  // letting error statuses propagate. See sveltejs/kit#12533 and #12987.
  const [
    resolvedUserOrgs,
    resolvedOrgUsers,
    resolvedPinnedAddons,
    resolvedPinnedProjects,
  ] = await Promise.all([user_orgs, org_users, pinnedAddons, pinnedProjects]);

  return {
    me,
    org,
    tipOfDay,
    breadcrumbs: [],
    user_orgs: resolvedUserOrgs,
    org_users: resolvedOrgUsers,
    pinnedAddons: resolvedPinnedAddons,
    pinnedProjects: resolvedPinnedProjects,
  };
}
