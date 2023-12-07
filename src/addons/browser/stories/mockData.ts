import { rest } from "msw";
import listFixture from "../../fixtures/addon-list.json";
import { baseApiUrl } from "../../../api/base.js";

const mockAddonUrl = new URL(`addons/`, baseApiUrl).toString();
/* Mock Request Handlers */
export const addons = {
  data: rest.get(mockAddonUrl, (req, res, ctx) => res(ctx.json(listFixture))),
  loading: rest.get(mockAddonUrl, (req, res, ctx) =>
    res(ctx.delay("infinite")),
  ),
  error: rest.get(mockAddonUrl, (req, res, ctx) =>
    res(
      ctx.status(400, "Ambiguous Error"),
      ctx.json("Something went horribly wrong."),
    ),
  ),
  empty: rest.get(mockAddonUrl, (req, res, ctx) =>
    res(ctx.json({ next: null, previous: null, results: [] })),
  ),
};
