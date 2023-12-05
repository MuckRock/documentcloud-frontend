import { rest } from "msw";
import { baseApiUrl } from "../../../api/base";
import run from "../../fixtures/run.json";
import runList from "../../fixtures/run-list.json";

const mockListUrl = new URL("/api/addon_runs/", baseApiUrl).toString();
const mockUpdateUrl = new URL("/api/addon_runs/:run", baseApiUrl).toString();

export const handlers = [
  rest.get(mockListUrl, (req, res, ctx) => res(ctx.json(runList))),
  rest.patch(mockUpdateUrl, async (req, res, ctx) => {
    const body = await req.json();
    console.log(JSON.stringify(body));
    return res(ctx.json({ ...run, ...body }));
  }),
  rest.delete(mockUpdateUrl, (req, res, ctx) => res(ctx.json({}))),
];
