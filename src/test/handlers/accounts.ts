import type { Org } from "$lib/api/types";

import { rest } from "msw";

import {
  freeOrg,
  me as meFixture,
  organizationsList,
  proOrg,
  usersList,
} from "../fixtures/accounts";
import {
  createApiUrl,
  dataHandler,
  emptyHandler,
  loadingHandler,
  errorHandler,
  generateGetHandler,
} from "./utils";

export const urls = {
  users: createApiUrl("users/*"),
  me: createApiUrl("users/me/"),
  orgs: createApiUrl("organizations/*"),
  org: createApiUrl("organizations/:id/*"),
  mailkey: createApiUrl("users/mailkey/"),
};

export const users = {
  data: rest.get(urls.users, dataHandler(usersList)),
  empty: rest.get(urls.users, emptyHandler()),
  loading: rest.get(urls.users, loadingHandler),
  error: rest.get(urls.users, errorHandler),
  me: rest.get(urls.me, dataHandler(meFixture)),
};

export const me = {
  data: rest.get(urls.me, dataHandler(meFixture)),
  empty: rest.get(urls.me, emptyHandler()),
  loading: rest.get(urls.me, loadingHandler),
  error: rest.get(urls.me, errorHandler),
};

export const organizations = {
  data: rest.get(urls.orgs, dataHandler(organizationsList)),
  empty: rest.get(urls.orgs, emptyHandler()),
  loading: rest.get(urls.orgs, loadingHandler),
  error: rest.get(urls.orgs, errorHandler),
};

export const mailkey = {
  create: rest.post(urls.mailkey, dataHandler({ mailkey: "xxxxxxxxx" })),
  delete: rest.delete(urls.mailkey, dataHandler(undefined)),
  createError: rest.post(urls.mailkey, errorHandler),
  deleteError: rest.delete(urls.mailkey, errorHandler),
};

/* Mock Request Handlers */
export const mockGetMe = {
  data: rest.get(urls.me, dataHandler(meFixture)),
  freeUser: rest.get(
    urls.me,
    dataHandler({
      ...meFixture,
      organization: freeOrg,
      admin_organizations: [...meFixture.admin_organizations, freeOrg.id],
    }),
  ),
  proUser: rest.get(urls.me, (req, res, ctx) =>
    res(
      ctx.json({
        ...meFixture,
        organization: proOrg,
        admin_organizations: [...meFixture.admin_organizations, proOrg.id],
      }),
    ),
  ),
  noOrgs: rest.get(urls.me, (req, res, ctx) =>
    res(ctx.json({ ...meFixture, organization: 4 })),
  ),
  orgAdmin: rest.get(urls.me, (req, res, ctx) =>
    res(
      ctx.json({
        ...meFixture,
        admin_organizations: [...meFixture.admin_organizations, 1],
      }),
    ),
  ),
  freeOrgMember: rest.get(urls.me, (req, res, ctx) =>
    res(
      ctx.json({
        ...meFixture,
        organization: { ...(meFixture.organization as Org), plan: "Free" },
      }),
    ),
  ),
  freeOrgAdmin: rest.get(urls.me, (req, res, ctx) =>
    res(
      ctx.json({
        ...meFixture,
        organization: { ...(meFixture.organization as Org), plan: "Free" },
        admin_organizations: [
          ...meFixture.admin_organizations,
          (meFixture.organization as Org).id,
        ],
      }),
    ),
  ),
  loading: rest.get(urls.me, (req, res, ctx) => res(ctx.delay("infinite"))),
  error: rest.get(urls.me, (req, res, ctx) =>
    res(ctx.status(404, "Not Found"), ctx.json({ detail: "Not found." })),
  ),
};

/* Mock Request Handlers */
export const mockInMyOrg = generateGetHandler(`users/*`, usersList);

export const mockGetOrgsList = {
  ...generateGetHandler(`organizations/`, organizationsList),
  empty: rest.get(urls.orgs, (req, res, ctx) =>
    res(
      ctx.json({
        next: null,
        previous: null,
        results: [organizationsList.results[1]],
      }),
    ),
  ),
};

export const mockGetOrg = {
  ...generateGetHandler(`organizations/:id/*`, {}),
  data: rest.get(urls.org, (req, res, ctx) =>
    res(
      ctx.json(
        organizationsList.results.find(
          ({ id }) => id.toString() === req.params.id,
        ),
      ),
    ),
  ),
  pro: rest.get(urls.org, (req, res, ctx) => res(ctx.json(proOrg))),
  free: rest.get(urls.org, (req, res, ctx) => res(ctx.json(freeOrg))),
};

export const mockChangeOrg = rest.patch(urls.me, (req, res, ctx) =>
  res(ctx.json(meFixture)),
);
