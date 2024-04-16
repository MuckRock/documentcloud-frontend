import { rest } from "msw";

import { me as meFixture } from "@/test/fixtures/accounts";
import projectFixture from "../fixtures/projects/project.json";
import projDocsPage1 from "../fixtures/projects/project-documents-expanded.json";
import projDocsPage2 from "../fixtures/projects/project-documents-2.json";
import oembedFixture from "../fixtures/oembed.json";

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

const urls = {
  users: u("users/"),
  me: u("users/me/"),
  documents: u("documents/"),
  search: u("documents/search/"),
  project: {
    info: u("projects/"),
    documents: u("projects/*/documents/"),
  },
  oembed: u("oembed/"),
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
