import { rest } from "msw";
import { BASE_API_URL } from "@/config/config.js";

import { documents as docs, pending } from "../fixtures/documents/pending";

const documentsUrl = new URL(`/api/documents/*`, BASE_API_URL).href;

export const documents = {
  list: rest.get(new URL("documents/", BASE_API_URL).href, (req, res, ctx) =>
    res(ctx.json(docs)),
  ),
  pending: rest.get(
    new URL("documents/pending/", BASE_API_URL).href,
    (req, res, ctx) => res(ctx.json(pending)),
  ),
  error: rest.get(
    new URL("documents/search/", "https://api.www.documentcloud.org/api/").href,
    (req, res, ctx) => res(ctx.status(500, "Something went wrong")),
  ),
};

export const revisionControl = {
  success: rest.patch(documentsUrl, (req, res, ctx) => res()),
  loading: rest.patch(documentsUrl, (req, res, ctx) =>
    res(ctx.delay("infinite")),
  ),
  error: rest.patch(documentsUrl, (req, res, ctx) =>
    res(
      ctx.status(400, "Ambiguous Error"),
      ctx.json("Something went horribly wrong."),
    ),
  ),
};
