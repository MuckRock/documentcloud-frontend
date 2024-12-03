import type {
  AddOnListItem,
  APIResponse,
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

export async function load({ fetch }) {
  const me = await getMe(fetch);
  const org = me?.organization as Org;
  const tipOfDay = me ? await getTipOfDay(fetch) : null;

  let user_orgs: Promise<Org[]> = Promise.resolve([]);
  let org_users: Promise<User[]> = Promise.resolve([]);
  let pinnedAddons: Promise<Nullable<APIResponse<Page<AddOnListItem>>>> =
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

  return {
    me,
    org,
    tipOfDay,
    breadcrumbs: [],
    user_orgs,
    org_users,
    pinnedAddons,
    pinnedProjects,
  };
}
