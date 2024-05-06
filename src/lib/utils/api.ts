import type { NumericRange } from "@sveltejs/kit";
import type { Page } from "@/api/types";
import { MAX_PER_PAGE } from "@/config/config";

export function isErrorCode(status: number): status is NumericRange<400, 599> {
  return status >= 400 && status <= 599;
}

export function isRedirectCode(
  status: number,
): status is NumericRange<300, 308> {
  return status >= 300 && status <= 308;
}

/**
 * Requests the specified URL and paginates through to return all
 * results if additional pages are present.
 */
export async function getAll<T>(
  url: URL,
  perPage: number = MAX_PER_PAGE,
  fetch = globalThis.fetch,
): Promise<Array<T>> {
  url.searchParams.set("per_page", String(perPage));
  const resp = await fetch(url, { credentials: "include" });
  const data: Page<T> = await resp.json();
  const results = data.results;
  if (data.next) {
    // Recursively fetch the next page
    const nextResults = await getAll<T>(new URL(data.next), perPage, fetch);
    return results.concat(nextResults);
  }
  return results;
}

/**
 * Handle the two-step redirect needed to get a private asset from S3.
 */
export async function getPrivateAsset(
  url: URL | string,
  fetch = globalThis.fetch,
): Promise<URL> {
  // any errors here should be caught higher up
  const resp = await fetch(url, {
    credentials: "include",
    redirect: "error",
    headers: {
      Accept: "application/json",
    },
  });

  // {"location": "s3 URL with credentials"}
  const { location } = await resp.json();

  // if this isn't a valid URL, it's an error
  return new URL(location);
}
