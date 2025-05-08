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

  const headers = Object.fromEntries(
    // @ts-ignore
    [...response.headers].filter(([k, v]) => k !== "link"),
  );

  const row = {
    timestamp: new Date().toJSON(),
    method,
    url,
    status,
    route: event.route.id,
    headers,
  };

  f(JSON.stringify(row));
}
