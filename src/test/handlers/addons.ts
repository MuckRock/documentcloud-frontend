import { http, HttpResponse } from "msw";

import {
  addonsList,
  run,
  runsList,
  eventsList,
  scheduled as klaxon,
} from "../fixtures/addons";

import { progress as scraper } from "../fixtures/addons/progress";

import {
  createApiUrl,
  dataHandler,
  emptyHandler,
  generateAllHandler,
  generateGetHandler,
} from "./utils";

/* Mock Handlers */

export const addons = generateGetHandler(`addons/`, addonsList);
export const history = generateGetHandler(`/api/addon_runs/*`, runsList);
export const scheduled = generateGetHandler(`/api/addon_events/*`, eventsList);

export const schedule = generateAllHandler(`/api/addon_events/:event`, klaxon);
export const send = generateAllHandler(`/api/addon_runs/`, {});
export const pin = generateAllHandler(`/api/addons/:id`, {});

const mockListUrl = createApiUrl("/api/addon_runs/");
const mockUpdateUrl = createApiUrl("/api/addon_runs/:run");

export const progress = [
  http.get(mockListUrl, () => HttpResponse.json(runsList)),
  http.patch(mockUpdateUrl, async ({ request }) => {
    const body = await request.json();
    console.log(JSON.stringify(body));
    return HttpResponse.json({ ...run, ...body });
  }),
  http.delete(mockUpdateUrl, () => HttpResponse.json({})),
];

export const runs = {
  data: http.get(createApiUrl("addon_runs/"), dataHandler(runsList)),
  empty: http.get(createApiUrl("addon_runs/"), emptyHandler()),
  running: http.get(
    createApiUrl("addon_runs/"),
    dataHandler({ results: scraper }),
  ),
};
