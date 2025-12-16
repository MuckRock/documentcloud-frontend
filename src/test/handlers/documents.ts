import { http, HttpResponse, delay } from "msw";
import { BASE_API_URL } from "@/config/config.js";

import { documents as docs, pending } from "../fixtures/documents/pending";
import { searchWithin as searchWithinResults } from "../fixtures/documents";
import { generateGetHandler } from "./utils";

const documentsUrl = new URL(`/api/documents/*`, BASE_API_URL).href;

export const documents = {
  list: http.get(new URL("documents/", BASE_API_URL).href, () => {
    return HttpResponse.json(docs);
  }),
  pending: http.get(new URL("documents/pending/", BASE_API_URL).href, () => {
    return HttpResponse.json(pending);
  }),
  error: http.get(
    new URL("documents/search/", "https://api.www.documentcloud.org/api/").href,
    () => {
      return new HttpResponse(null, {
        status: 500,
        statusText: "Something went wrong",
      });
    },
  ),
};

export const revisionControl = {
  success: http.patch(documentsUrl, () => {
    return new HttpResponse(null, { status: 200 });
  }),
  loading: http.patch(documentsUrl, async () => {
    await delay("infinite");
    return new HttpResponse(null, { status: 200 });
  }),
  error: http.patch(documentsUrl, () => {
    return HttpResponse.json("Something went horribly wrong.", {
      status: 400,
      statusText: "Ambiguous Error",
    });
  }),
};

export const searchWithin = generateGetHandler(
  "documents/:id/search",
  searchWithinResults,
);
