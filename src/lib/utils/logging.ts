// log requests

import type { RequestEvent } from "@sveltejs/kit";

/**
 * Log a request inside a Handle function
 * @param status
 * @param event
 */
export function log(event: RequestEvent, response: Response): void {
  // be loud about errors
  const status = response.status;
  const f = status >= 400 ? console.warn : console.info;

  const { method, url } = event.request;
  const cache = response.headers.get("cache-control") ?? "";
  const etag = response.headers.get("etag") ?? "";

  const row = [
    new Date(),
    method,
    url,
    status,
    event.route.id,
    etag,
    cache,
  ].filter(Boolean);

  f(...row);
}
