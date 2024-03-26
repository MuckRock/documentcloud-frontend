import { rest } from "msw";
import { baseApiUrl } from "../../api/base.js";
import { addonsList, run, runsList, eventsList } from "../fixtures/addons";

function generateGetHandler<T>(path: string, data: T) {
  const route = new URL(path, baseApiUrl).toString();
  return {
    data: rest.get(route, (req, res, ctx) => res(ctx.json(data))),
    loading: rest.get(route, (req, res, ctx) => res(ctx.delay("infinite"))),
    error: rest.get(route, (req, res, ctx) =>
      res(
        ctx.status(400, "Ambiguous Error"),
        ctx.json("Something went horribly wrong."),
      ),
    ),
    empty: rest.get(route, (req, res, ctx) =>
      res(ctx.json({ next: null, previous: null, results: [] })),
    ),
  };
}

function generateAllHandler<T>(path: string, data: T) {
  const route = new URL(path, baseApiUrl).toString();
  return {
    success: rest.all(route, (req, res, ctx) => res(ctx.json(data))),
    loading: rest.all(route, (req, res, ctx) => res(ctx.delay("infinite"))),
    error: rest.all(route, (req, res, ctx) =>
      res(ctx.status(400, "Something went wrong")),
    ),
  };
}

/* Mock Handlers */

export const addons = generateGetHandler(`addons/`, addonsList);
export const history = generateGetHandler(`/api/addon_runs/*`, runsList);
export const scheduled = generateGetHandler(`/api/addon_events/*`, eventsList);

export const schedule = generateAllHandler(`/api/addon_events/:event`, {});
export const send = generateAllHandler(`/api/addon_runs/`, {});
export const pin = generateAllHandler(`/api/addons/:id`, {});

const mockListUrl = new URL("/api/addon_runs/", baseApiUrl).toString();
const mockUpdateUrl = new URL("/api/addon_runs/:run", baseApiUrl).toString();
export const progress = [
  rest.get(mockListUrl, (req, res, ctx) => res(ctx.json(runsList))),
  rest.patch(mockUpdateUrl, async (req, res, ctx) => {
    const body = await req.json();
    console.log(JSON.stringify(body));
    return res(ctx.json({ ...run, ...body }));
  }),
  rest.delete(mockUpdateUrl, (req, res, ctx) => res(ctx.json({}))),
];
