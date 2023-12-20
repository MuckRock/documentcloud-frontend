import { rest } from "msw";
import { baseApiUrl } from "../../../api/base.js";

import usersFixture from "../fixtures/users.json";
import orgFixtures from "../fixtures/organizations.json";
import projectFixtures from "../fixtures/projects.json";
import meFixture from "../fixtures/me.json";
import runFixtures from "../fixtures/addon_runs.json";

const urls = {
  users: new URL("users/", baseApiUrl).toString(),
  me: new URL("users/me/", baseApiUrl).toString(),
  organizations: new URL("organizations", baseApiUrl).toString(),
  projects: new URL("projects/", baseApiUrl).toString(),
  runs: new URL("addon_runs/", baseApiUrl).toString(),
};

export const users = {
  data: rest.get(urls.users, (req, res, ctx) => res(ctx.json(usersFixture))),

  me: rest.get(urls.me, (req, res, ctx) => res(ctx.json(meFixture))),

  loading: rest.get(urls.users, (req, res, ctx) => ctx.delay("infinite")),

  error: rest.get(urls.users, (req, res, ctx) =>
    res(ctx.status(404, "Not Found"), ctx.json({ detail: "Not found." })),
  ),
};

export const organizations = {
  data: rest.get(urls.organizations, (req, res, ctx) =>
    res(ctx.json(orgFixtures)),
  ),

  loading: rest.get(urls.organizations, (req, res, ctx) =>
    ctx.delay("infinite"),
  ),

  error: rest.get(urls.organizations, (req, res, ctx) =>
    res(ctx.status(404, "Not Found"), ctx.json({ detail: "Not found." })),
  ),
};

export const projects = {
  data: rest.get(urls.projects, (req, res, ctx) =>
    res(ctx.json(projectFixtures)),
  ),

  loading: rest.get(urls.projects, (req, res, ctx) => ctx.delay("infinite")),

  error: rest.get(urls.projects, (req, res, ctx) =>
    res(ctx.status(404, "Not Found"), ctx.json({ detail: "Not found." })),
  ),
};

export const runs = {
  data: rest.get(urls.runs, (req, res, ctx) => res(ctx.json(runFixtures))),
};
