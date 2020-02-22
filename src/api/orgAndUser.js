import session from "./session";
import { USER_EXPAND, ORG_EXPAND, DEFAULT_EXPAND } from "./common";
import { queryBuilder } from "@/util/url";
import { grabAllPages } from "@/util/paginate";
import { apiUrl } from "./base";

export async function getMe(expand = DEFAULT_EXPAND) {
  const { data } = await session.get(
    queryBuilder(apiUrl(`users/me/`), { expand })
  );
  return data;
}

export async function getOrganizations(
  individual = false,
  expand = ORG_EXPAND
) {
  const orgs = await grabAllPages(
    queryBuilder(apiUrl(`organizations/`), { individual, expand })
  );
  return orgs;
}

export async function getUsers({ projectIds, orgIds }, expand = USER_EXPAND) {
  if (projectIds != null && orgIds != null) {
    throw new Error("Only specify one of project or org ids");
  }

  const query = { expand };
  if (projectIds != null) {
    query["project"] = projectIds.map(id => `${id}`).join(",");
  }
  if (orgIds != null) {
    query["organization"] = orgIds.map(id => `${id}`).join(",");
  }

  const users = await grabAllPages(queryBuilder(apiUrl(`users/`), query));
  return users;
}
