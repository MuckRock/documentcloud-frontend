import { http, HttpResponse, delay } from "msw";
import { BASE_API_URL } from "@/config/config.js";

export function createApiUrl(path: string): string {
  return new URL(path, BASE_API_URL).toString();
}

export const dataHandler = (data) => () => {
  return HttpResponse.json(data);
};

export const emptyHandler = (emptyData: any = []) => () => {
  return HttpResponse.json(emptyData);
};

export const errorHandler = () => {
  return HttpResponse.json(
    { detail: "Not found." },
    { status: 404, statusText: "Not Found" },
  );
};

export const loadingHandler = async () => {
  await delay("infinite");
  return new HttpResponse(null, { status: 200 });
};

export function generateGetHandler<T>(path: string, data: T, emptyData = []) {
  const route = createApiUrl(path);
  return {
    data: http.get(route, dataHandler(data)),
    loading: http.get(route, loadingHandler),
    error: http.get(route, errorHandler),
    empty: http.get(route, emptyHandler(emptyData)),
  };
}

export function generateAllHandler<T>(path: string, data: T) {
  const route = createApiUrl(path);
  return {
    success: http.all(route, dataHandler(data)),
    loading: http.all(route, loadingHandler),
    error: http.all(route, errorHandler),
  };
}

// alternates between two pages of data to simulate pagination
export function pageHandler<T>(one: T, two: T) {
  let page = 0;
  return () => {
    const data = page++ % 2 ? two : one;
    return HttpResponse.json(data);
  };
}
