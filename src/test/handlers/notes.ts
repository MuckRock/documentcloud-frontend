import { http, HttpResponse } from "msw";

import { documentNotes, documentNotesPages } from "../fixtures/notes";
import { createApiUrl, errorHandler, loadingHandler } from "./utils";

const route = createApiUrl("documents/:id/notes/");

export const notes = {
  /** All of a document's notes in a single page */
  data: http.get(route, () =>
    HttpResponse.json({ next: null, previous: null, results: documentNotes }),
  ),
  /** The same notes across two pages; the `cursor` param picks the page */
  paginated: http.get(route, ({ request }) => {
    const cursor = new URL(request.url).searchParams.get("cursor");
    return HttpResponse.json(
      cursor === "page-2" ? documentNotesPages[1] : documentNotesPages[0],
    );
  }),
  empty: http.get(route, () =>
    HttpResponse.json({ next: null, previous: null, results: [] }),
  ),
  loading: http.get(route, loadingHandler),
  error: http.get(route, errorHandler),
};
