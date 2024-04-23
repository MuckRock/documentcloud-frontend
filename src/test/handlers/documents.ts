import { rest } from "msw";
import { baseApiUrl } from "../../api/base";

const documentsUrl = new URL(`/api/documents/*`, baseApiUrl).toString();
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
