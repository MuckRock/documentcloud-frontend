import { rest } from "msw";
import { BASE_API_URL } from "@/config/config.js";

export function createApiUrl(path: string): string {
  return new URL(path, BASE_API_URL).toString();
}

export const dataHandler = (data) => (req, res, ctx) => res(ctx.json(data));

export const emptyHandler =
  (emptyData: any = []) =>
  (req, res, ctx) =>
    res(ctx.json(emptyData));

export const errorHandler = (req, res, ctx) =>
  res(ctx.status(404, "Not Found"), ctx.json({ detail: "Not found." }));

export const loadingHandler = (req, res, ctx) => res(ctx.delay("infinite"));

export function generateGetHandler<T>(path: string, data: T, emptyData = []) {
  const route = createApiUrl(path);
  return {
    data: rest.get(route, dataHandler(data)),
    loading: rest.get(route, loadingHandler),
    error: rest.get(route, errorHandler),
    empty: rest.get(route, emptyHandler(emptyData)),
  };
}

export function generateAllHandler<T>(path: string, data: T) {
  const route = createApiUrl(path);
  return {
    success: rest.all(route, dataHandler(data)),
    loading: rest.all(route, loadingHandler),
    error: rest.all(route, errorHandler),
  };
}

// alternates between two pages of data to simulate pagination
export function pageHandler<T>(one: T, two: T) {
  let page = 0;
  return (req, res, ctx) => {
    const data = page++ % 2 ? two : one;
    res(ctx.json(data));
  };
}
