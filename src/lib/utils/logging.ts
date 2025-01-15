// log requests

import type { RequestEvent } from "@sveltejs/kit";

/**
 * Log a request inside a Handle function
 * @param status
 * @param event
 */
export function log(status: number, event: RequestEvent): void {
  // be loud about errors
  const f = status >= 400 ? console.warn : console.info;

  const { method, url } = event.request;

  const row = [new Date(), method, url, status, event.platform?.context ?? ""];

  f(...row);
}
