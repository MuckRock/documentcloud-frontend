import { rest } from "msw";
import { baseApiUrl } from "../../../api/base";

const documents = new URL(`/api/documents/*`, baseApiUrl).toString();
export const revisionControl = {
  success: rest.patch(documents, (req, res, ctx) => res()),
  loading: rest.patch(documents, (req, res, ctx) => res(ctx.delay("infinite"))),
  error: rest.patch(documents, (req, res, ctx) =>
    res(
      ctx.status(400, "Ambiguous Error"),
      ctx.json("Something went horribly wrong."),
    ),
  ),
};
