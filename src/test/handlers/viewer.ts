import { rest } from "msw";

export const simulatePDF403Error = (asset_url: string) =>
  rest.get(asset_url, (req, res, ctx) =>
    res(ctx.status(403, "Not Found"), ctx.json({ detail: "Not found." })),
  );
