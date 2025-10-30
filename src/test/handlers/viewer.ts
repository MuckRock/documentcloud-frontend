import { http, HttpResponse } from "msw";

export const simulatePDF403Error = (asset_url: string) =>
  http.get(asset_url, () => {
    return HttpResponse.json(
      { detail: "Not found." },
      { status: 403, statusText: "Not Found" },
    );
  });
