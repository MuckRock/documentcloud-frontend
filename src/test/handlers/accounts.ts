import { rest } from "msw";
import { baseApiUrl } from "../../api/base.js";
import {
  freeOrg,
  me as meFixture,
  organizationsList,
  proOrg,
  usersList,
} from "../fixtures/accounts";
import { Org } from "../../api/types/orgAndUser";
import {
  createApiUrl,
  dataHandler,
  emptyHandler,
  loadingHandler,
  errorHandler,
  generateGetHandler,
} from "./utils";

export const users = {
  data: rest.get(createApiUrl("users/"), dataHandler(usersList)),
  empty: rest.get(createApiUrl("users/"), emptyHandler()),
  loading: rest.get(createApiUrl("users/"), loadingHandler),
  error: rest.get(createApiUrl("users/"), errorHandler),
  me: rest.get(createApiUrl("users/me/"), dataHandler(meFixture)),
};

export const me = {
  data: rest.get(createApiUrl("users/me/"), dataHandler(meFixture)),
  empty: rest.get(createApiUrl("users/me/"), emptyHandler()),
  loading: rest.get(createApiUrl("users/me/"), loadingHandler),
  error: rest.get(createApiUrl("users/me/"), errorHandler),
};

export const organizations = {
  data: rest.get(createApiUrl("organizations"), dataHandler(organizationsList)),
  empty: rest.get(createApiUrl("organizations"), emptyHandler()),
  loading: rest.get(createApiUrl("organizations"), loadingHandler),
  error: rest.get(createApiUrl("organizations"), errorHandler),
};

/* Mock Request Handlers */
const meUrl = new URL(`users/me/`, baseApiUrl).toString();
export const mockGetMe = {
  data: rest.get(meUrl, dataHandler(meFixture)),
  freeUser: rest.get(
    meUrl,
    dataHandler({
      ...meFixture,
      organization: freeOrg,
      admin_organizations: [...meFixture.admin_organizations, freeOrg.id],
    }),
  ),
  proUser: rest.get(meUrl, (req, res, ctx) =>
    res(
      ctx.json({
        ...meFixture,
        organization: proOrg,
        admin_organizations: [...meFixture.admin_organizations, proOrg.id],
      }),
    ),
  ),
  noOrgs: rest.get(meUrl, (req, res, ctx) =>
    res(ctx.json({ ...meFixture, organization: 4 })),
  ),
  orgAdmin: rest.get(meUrl, (req, res, ctx) =>
    res(
      ctx.json({
        ...meFixture,
        admin_organizations: [...meFixture.admin_organizations, 1],
      }),
    ),
  ),
  freeOrgMember: rest.get(meUrl, (req, res, ctx) =>
    res(
      ctx.json({
        ...meFixture,
        organization: { ...(meFixture.organization as Org), plan: "Free" },
      }),
    ),
  ),
  freeOrgAdmin: rest.get(meUrl, (req, res, ctx) =>
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
  loading: rest.get(meUrl, (req, res, ctx) => res(ctx.delay("infinite"))),
  error: rest.get(meUrl, (req, res, ctx) =>
    res(ctx.status(404, "Not Found"), ctx.json({ detail: "Not found." })),
  ),
};

/* Mock Request Handlers */
export const mockInMyOrg = generateGetHandler(`users/*`, usersList);

const listOrgsUrl = new URL(`organizations/`, baseApiUrl).toString();
export const mockGetOrgsList = {
  ...generateGetHandler(`organizations/`, organizationsList),
  empty: rest.get(listOrgsUrl, (req, res, ctx) =>
    res(
      ctx.json({
        next: null,
        previous: null,
        results: [organizationsList.results[1]],
      }),
    ),
  ),
};

const getOrgUrl = new URL(`organizations/:id/*`, baseApiUrl).toString();
export const mockGetOrg = {
  ...generateGetHandler(`organizations/:id/*`, {}),
  data: rest.get(getOrgUrl, (req, res, ctx) =>
    res(
      ctx.json(
        organizationsList.results.find(
          ({ id }) => id.toString() === req.params.id,
        ),
      ),
    ),
  ),
  pro: rest.get(getOrgUrl, (req, res, ctx) => res(ctx.json(proOrg))),
  free: rest.get(getOrgUrl, (req, res, ctx) => res(ctx.json(freeOrg))),
};

export const mockChangeOrg = rest.patch(meUrl, (req, res, ctx) =>
  res(ctx.json(meFixture)),
);
