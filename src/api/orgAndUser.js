import session, { cookiesEnabled } from "./session";
import { USER_EXPAND, ORG_EXPAND, DEFAULT_EXPAND } from "./common";
import { queryBuilder } from "@/util/url";
import { grabAllPages } from "@/util/paginate";
import { apiUrl } from "./base";

const hasCsrfToken = /(^|;\s*)csrftoken=[a-zA-Z0-9]+/;

export async function getMe(expand = DEFAULT_EXPAND) {
  // Check that the user is logged in via cookies
  if (cookiesEnabled) {
    if (!hasCsrfToken.test(document.cookie)) {
      return null;
    }
  }
  // Check that the user is logged in via network request
  try {
    const { data } = await session.get(
      queryBuilder(apiUrl(`users/me/`), { expand }),
    );
    return data;
  } catch (e) {
    return null;
  }
}

export async function getUser(id, expand = DEFAULT_EXPAND) {
  const { data } = await session.get(
    queryBuilder(apiUrl(`users/${id}/`), { expand }),
  );
  return data;
}

export async function changeActiveOrg(orgId) {
  await session.patch(apiUrl(`users/me/`), { organization: orgId });
}

export async function getOrganization(id, expand = ORG_EXPAND) {
  const { data } = await session.get(
    queryBuilder(apiUrl(`organizations/${id}/`), { expand }),
  );
  return data;
}

export async function getOrganizations(individual = null, expand = ORG_EXPAND) {
  const orgs = await grabAllPages(
    queryBuilder(apiUrl(`organizations/`), { individual, expand }),
  );
  return orgs;
}

export async function getOrganizationsByIds(ids, expand = ORG_EXPAND) {
  const orgs = await grabAllPages(
    queryBuilder(apiUrl(`organizations/`), { id__in: ids, expand }),
  );
  return orgs;
}

export async function getUsers({ projectIds, orgIds }, expand = USER_EXPAND) {
  if (projectIds != null && orgIds != null) {
    throw new Error("Only specify one of project or org ids");
  }

  const query = { expand };
  if (projectIds != null) {
    query["project"] = projectIds.map((id) => `${id}`).join(",");
  }
  if (orgIds != null) {
    query["organization"] = orgIds.map((id) => `${id}`).join(",");
  }

  const users = await grabAllPages(queryBuilder(apiUrl(`users/`), query));
  return users;
}

export async function autocompleteOrganizations(
  prefix = "",
  individual = false,
) {
  const { data } = await session.get(
    queryBuilder(apiUrl("organizations/"), {
      name__istartswith: prefix,
      individual,
    }),
  );
  return data.results;
}

export async function autocompleteUsers(prefix = "", orgIds = null) {
  const { data } = await session.get(
    queryBuilder(apiUrl("users/"), {
      name__istartswith: prefix,
      organization: orgIds == null ? null : orgIds.map((x) => `${x}`).join(","),
    }),
  );
  return data.results;
}
