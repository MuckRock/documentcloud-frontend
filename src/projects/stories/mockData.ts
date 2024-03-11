import { rest } from "msw";
import { projects } from "../../api/fixtures/projects.fixtures";
import { baseApiUrl } from "../../api/base.js";

const mockUrl = new URL(`projects/`, baseApiUrl).toString();
/* Mock Request Handlers */
export const projectHandlers = {
  data: rest.get(mockUrl, (req, res, ctx) => res(ctx.json(projects))),
  loading: rest.get(mockUrl, (req, res, ctx) => res(ctx.delay("infinite"))),
  error: rest.get(mockUrl, (req, res, ctx) =>
    res(
      ctx.status(400, "Ambiguous Error"),
      ctx.json("Something went horribly wrong."),
    ),
  ),
  empty: rest.get(mockUrl, (req, res, ctx) =>
    res(ctx.json({ next: null, previous: null, results: [] })),
  ),
};
