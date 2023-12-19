import { rest } from "msw";
import { baseApiUrl } from "../../../api/base.js";

import usersFixture from "../fixtures/users.json";
import orgFixtures from "../fixtures/organizations.json";
import listFixture from "../../../addons/fixtures/addon-list.json";
import { projectList } from "../../../api/test/fixtures/project";
import { emptyList } from "../../../api/test/fixtures/empty";
import meFixture from "../fixtures/me.json";
import runFixtures from "../fixtures/addon_runs.json";

function createApiUrl(path: string): string {
  return new URL(path, baseApiUrl).toString();
}

const errorHandler = (req, res, ctx) =>
  res(ctx.status(404, "Not Found"), ctx.json({ detail: "Not found." }));
const loadingHandler = (req, res, ctx) => res(ctx.delay("infinite"));
const dataHandler = (data) => (req, res, ctx) => res(ctx.json(data));
const emptyHandler = (req, res, ctx) => res(ctx.json(emptyList));

const urls = {
  users: createApiUrl("users/"),
  me: createApiUrl("users/me/"),
  organizations: createApiUrl("organizations"),
  projects: createApiUrl("projects/"),
  runs: createApiUrl("addon_runs/"),
  addons: createApiUrl("addons/"),
};

export const addons = {
  data: rest.get(urls.addons, dataHandler(listFixture)),
  loading: rest.get(urls.addons, loadingHandler),
  error: rest.get(urls.addons, errorHandler),
  empty: rest.get(urls.addons, emptyHandler),
};

export const users = {
  data: rest.get(urls.users, dataHandler(usersFixture)),
  empty: rest.get(urls.users, emptyHandler),
  loading: rest.get(urls.users, loadingHandler),
  error: rest.get(urls.users, errorHandler),
  me: rest.get(urls.me, dataHandler(meFixture)),
};

export const me = {
  data: rest.get(urls.me, dataHandler(meFixture)),
  empty: rest.get(urls.me, emptyHandler),
  loading: rest.get(urls.me, loadingHandler),
  error: rest.get(urls.me, errorHandler),
};

export const organizations = {
  data: rest.get(urls.organizations, dataHandler(orgFixtures)),
  empty: rest.get(urls.organizations, emptyHandler),
  loading: rest.get(urls.organizations, loadingHandler),
  error: rest.get(urls.organizations, errorHandler),
};

export const projects = {
  data: rest.get(urls.projects, (req, res, ctx) => res(ctx.json(projectList))),
  empty: rest.get(urls.projects, (req, res, ctx) => res(ctx.json(emptyList))),
  loading: rest.get(urls.projects, loadingHandler),
  error: rest.get(urls.projects, errorHandler),
};

export const runs = {
  data: rest.get(urls.runs, dataHandler(runFixtures)),
};
