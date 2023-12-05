import { rest } from "msw";
import { baseApiUrl } from "../../../api/base";
import runListFixture from "../../fixtures/run-list.json";
import eventsListFixture from "../../fixtures/event-list.json";

const mockRunsUrl = new URL(`/api/addon_runs/*`, baseApiUrl).toString();
export const history = {
  data: rest.get(mockRunsUrl, (req, res, ctx) => res(ctx.json(runListFixture))),
  loading: rest.get(mockRunsUrl, (req, res, ctx) => res(ctx.delay("infinite"))),
  error: rest.get(mockRunsUrl, (req, res, ctx) =>
    res(
      ctx.status(400, "Ambiguous Error"),
      ctx.json("Something went horribly wrong."),
    ),
  ),
  empty: rest.get(mockRunsUrl, (req, res, ctx) =>
    res(ctx.json({ next: null, previous: null, results: [] })),
  ),
};

const mockEventsUrl = new URL(`/api/addon_events/*`, baseApiUrl).toString();
export const scheduled = {
  data: rest.get(mockEventsUrl, (req, res, ctx) =>
    res(ctx.json(eventsListFixture)),
  ),
  loading: rest.get(mockEventsUrl, (req, res, ctx) =>
    res(ctx.delay("infinite")),
  ),
  error: rest.get(mockEventsUrl, (req, res, ctx) =>
    res(
      ctx.status(400, "Ambiguous Error"),
      ctx.json("Something went horribly wrong."),
    ),
  ),
  empty: rest.get(mockEventsUrl, (req, res, ctx) =>
    res(ctx.json({ next: null, previous: null, results: [] })),
  ),
};
