import type { Org } from "$lib/api/types";

import { http, HttpResponse } from "msw";

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
  orgs: createApiUrl("organizations/"),
  org: createApiUrl("organizations/:id/*"),
  mailkey: createApiUrl("users/mailkey/"),
};

export const users = {
  data: http.get(urls.users, dataHandler(usersList)),
  empty: http.get(urls.users, emptyHandler()),
  loading: http.get(urls.users, loadingHandler),
  error: http.get(urls.users, errorHandler),
  me: http.get(urls.me, dataHandler(meFixture)),
};

export const me = {
  data: http.get(urls.me, dataHandler(meFixture)),
  empty: http.get(urls.me, emptyHandler()),
  loading: http.get(urls.me, loadingHandler),
  error: http.get(urls.me, errorHandler),
};

export const organizations = {
  data: http.get(urls.orgs, dataHandler(organizationsList)),
  empty: http.get(urls.orgs, emptyHandler()),
  loading: http.get(urls.orgs, loadingHandler),
  error: http.get(urls.orgs, errorHandler),
};

export const mailkey = {
  create: http.post(urls.mailkey, dataHandler({ mailkey: "xxxxxxxxx" })),
  delete: http.delete(urls.mailkey, dataHandler(undefined)),
  createError: http.post(urls.mailkey, errorHandler),
  deleteError: http.delete(urls.mailkey, errorHandler),
};

/* Mock Request Handlers */
export const mockGetMe = {
  data: http.get(urls.me, dataHandler(meFixture)),
  freeUser: http.get(
    urls.me,
    dataHandler({
      ...meFixture,
      organization: freeOrg,
      admin_organizations: [...meFixture.admin_organizations, freeOrg.id],
    }),
  ),
  proUser: http.get(urls.me, () => {
    return HttpResponse.json({
      ...meFixture,
      organization: proOrg,
      admin_organizations: [...meFixture.admin_organizations, proOrg.id],
    });
  }),
  noOrgs: http.get(urls.me, () => {
    return HttpResponse.json({ ...meFixture, organization: 4 });
  }),
  orgAdmin: http.get(urls.me, () => {
    return HttpResponse.json({
      ...meFixture,
      admin_organizations: [...meFixture.admin_organizations, 1],
    });
  }),
  freeOrgMember: http.get(urls.me, () => {
    return HttpResponse.json({
      ...meFixture,
      organization: { ...(meFixture.organization as Org), plan: "Free" },
    });
  }),
  freeOrgAdmin: http.get(urls.me, () => {
    return HttpResponse.json({
      ...meFixture,
      organization: { ...(meFixture.organization as Org), plan: "Free" },
      admin_organizations: [
        ...meFixture.admin_organizations,
        (meFixture.organization as Org).id,
      ],
    });
  }),
  loading: http.get(urls.me, loadingHandler),
  error: http.get(urls.me, errorHandler),
};

/* Mock Request Handlers */
export const mockInMyOrg = generateGetHandler(`users/*`, usersList);

export const mockGetOrgsList = {
  ...generateGetHandler(`organizations/`, organizationsList),
  empty: http.get(urls.orgs, () => {
    return HttpResponse.json({
      next: null,
      previous: null,
      results: [organizationsList.results[1]],
    });
  }),
};

export const mockGetOrg = {
  ...generateGetHandler(`organizations/:id/*`, {}),
  data: http.get(urls.org, ({ params }) => {
    return HttpResponse.json(
      organizationsList.results.find(
        ({ id }) => id.toString() === params.id,
      ),
    );
  }),
  pro: http.get(urls.org, () => HttpResponse.json(proOrg)),
  free: http.get(urls.org, () => HttpResponse.json(freeOrg)),
};

export const mockChangeOrg = http.patch(urls.me, () => {
  return HttpResponse.json(meFixture);
});
