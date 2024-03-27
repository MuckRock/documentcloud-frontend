import { rest } from "msw";
import { baseApiUrl } from "../../api/base.js";
import {
  addonsList,
  run,
  runsList,
  eventsList,
  scheduled as klaxon,
} from "../fixtures/addons";
import {
  createApiUrl,
  dataHandler,
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
  rest.get(mockListUrl, (req, res, ctx) => res(ctx.json(runsList))),
  rest.patch(mockUpdateUrl, async (req, res, ctx) => {
    const body = await req.json();
    console.log(JSON.stringify(body));
    return res(ctx.json({ ...run, ...body }));
  }),
  rest.delete(mockUpdateUrl, (req, res, ctx) => res(ctx.json({}))),
];

export const runs = {
  data: rest.get(createApiUrl("addon_runs/"), dataHandler(runsList)),
};
