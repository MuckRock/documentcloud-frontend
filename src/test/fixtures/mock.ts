import { rest } from "msw";

import { me as meFixture } from "./accounts";
import projectFixture from "./projects/project.json";
import projDocsPage1 from "./projects/project-documents-expanded.json";
import projDocsPage2 from "./projects/project-documents-2.json";
import oembedFixture from "./oembed.json";

import { BASE_API_URL } from "@/config/config.js";

// api URL helper
function u(path) {
  return new URL(path, BASE_API_URL).toString();
}

const dataHandler = (data) => (req, res, ctx) => res(ctx.json(data));
const errorHandler = (req, res, ctx) =>
  res(ctx.status(404, "Not Found"), ctx.json({ detail: "Not found." }));

// alternate between two pages of data to simulate pagination
function pageHandler(one, two) {
  let page = 0;
  return (req, res, ctx) => {
    const data = page++ % 2 ? two : one;
    res(ctx.json(data));
  };
}

export const urls = {
  users: u("users/"),
  me: u("users/me/"),
  mailkey: u("users/mailkey/"),
  documents: u("documents/"),
  search: u("documents/search/"),
  project: {
    info: u("projects/"),
    documents: u("projects/*/documents/"),
  },
  oembed: u("oembed/"),
  loading: u("loading/"), // use this to signal infinite loading state
};

export const me = {
  data: rest.get(urls.me, dataHandler(meFixture)),
  error: rest.get(urls.me, errorHandler),
};

export const projects = {
  info: rest.get(urls.project.info, dataHandler(projectFixture)),
  documents: rest.get(
    urls.project.documents,
    pageHandler(projDocsPage1, projDocsPage2),
  ),
};

export const oembed = rest.get(urls.oembed, dataHandler(oembedFixture));

export const loading = rest.get(urls.loading, (req, res, ctx) =>
  res(ctx.delay("infinite")),
);

export const mailkey = {
  create: rest.post(urls.mailkey, dataHandler({ mailkey: "xxxxxxxxx" })),
  delete: rest.delete(urls.mailkey, dataHandler(undefined)),
  createError: rest.post(urls.mailkey, errorHandler),
  deleteError: rest.delete(urls.mailkey, errorHandler),
};
