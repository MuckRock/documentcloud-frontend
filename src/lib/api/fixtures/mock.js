import { rest } from "msw";

import meFixture from "../fixtures/users/me.json";

import { BASE_API_URL } from "@/config/config.js";

// api URL helper
function u(path) {
  return new URL(path, BASE_API_URL).toString();
}

const dataHandler = (data) => (req, res, ctx) => res(ctx.json(data));
const errorHandler = (req, res, ctx) =>
  res(ctx.status(404, "Not Found"), ctx.json({ detail: "Not found." }));

const urls = {
  users: u("users/"),
  me: u("users/me/"),
  documents: u("documents/"),
  search: u("documents/search/"),
};

export const me = {
  data: rest.get(urls.me, dataHandler(meFixture)),
  error: rest.get(urls.me, errorHandler),
};
