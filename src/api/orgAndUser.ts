import session, { cookiesEnabled, getCsrfToken } from "./session.js";
import { USER_EXPAND, ORG_EXPAND, DEFAULT_EXPAND } from "./common.js";
import { queryBuilder } from "../util/url.js";
import { grabAllPages } from "../util/paginate.js";
import { apiUrl } from "./base.js";
import type { Nullable, Org, User } from "./types";

export async function getMe(expand = DEFAULT_EXPAND): Promise<Nullable<User>> {
  // Check that the user is logged in via cookies
  if (cookiesEnabled && !getCsrfToken()) return null;
  // Check that the user is logged in via network request
  const { status, data } = await session.get(
    queryBuilder(apiUrl(`users/me/`), { expand }),
  );
  if (status !== 200) return null;
  return data;
}

export async function getUser(
  id: number,
  expand = DEFAULT_EXPAND,
): Promise<User> {
  const { data } = await session.get(
    queryBuilder(apiUrl(`users/${id}/`), { expand }),
  );
  return data;
}

export async function changeActiveOrg(orgId: number): Promise<void> {
  await session.patch(apiUrl(`users/me/`), { organization: orgId });
}

export async function getOrganization(
  id: number,
  expand = ORG_EXPAND,
): Promise<Org> {
  const { data } = await session.get(
    queryBuilder(apiUrl(`organizations/${id}/`), { expand }),
  );
  return data;
}

export async function getOrganizations(
  individual = null,
  expand = ORG_EXPAND,
): Promise<Org[]> {
  const orgs = await grabAllPages(
    queryBuilder(apiUrl(`organizations/`), { individual, expand }),
  );
  return orgs;
}

export async function getOrganizationsByIds(
  ids: number[],
  expand = ORG_EXPAND,
): Promise<Org[]> {
  const orgs = await grabAllPages(
    queryBuilder(apiUrl(`organizations/`), { id__in: ids, expand }),
  );
  return orgs;
}

export async function getUsers(
  { projectIds, orgIds }: { projectIds: number[]; orgIds: number[] },
  expand = USER_EXPAND,
): Promise<User[]> {
  if (projectIds != null && orgIds != null) {
    throw new Error("Only specify one of project or org ids");
  }

  const query = { expand };
  if (projectIds != null) {
    query["project"] = projectIds.map(String).join(",");
  }
  if (orgIds != null) {
    query["organization"] = orgIds.map(String).join(",");
  }

  const users = await grabAllPages(queryBuilder(apiUrl(`users/`), query));
  return users;
}

export async function autocompleteOrganizations(
  prefix = "",
  individual = false,
): Promise<Org[]> {
  const { data } = await session.get(
    queryBuilder(apiUrl("organizations/"), {
      name__istartswith: prefix,
      individual,
      version: "2.0",
    }),
  );
  return data.results;
}

export async function autocompleteUsers(
  prefix = "",
  orgIds = null,
): Promise<User> {
  const { data } = await session.get(
    queryBuilder(apiUrl("users/"), {
      name__istartswith: prefix,
      organization: orgIds == null ? null : orgIds.map((x) => `${x}`).join(","),
      version: "2.0",
    }),
  );
  return data.results;
}

export async function createMailkey(): Promise<string> {
  const { data } = await session.post(apiUrl("users/mailkey/"));
  return data.mailkey;
}

export async function destroyMailkey(): Promise<void> {
  await session.delete(apiUrl("users/mailkey/"));
}
