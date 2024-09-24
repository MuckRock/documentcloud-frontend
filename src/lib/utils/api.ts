import type { NumericRange } from "@sveltejs/kit";
import type { Page } from "@/api/types";
import type { APIError, APIResponse } from "$lib/api/types";
import { CSRF_COOKIE_NAME, MAX_PER_PAGE } from "@/config/config";

export function isErrorCode(status: number): status is NumericRange<400, 599> {
  return status >= 400 && status <= 599;
}

export function isRedirectCode(
  status: number,
): status is NumericRange<300, 308> {
  return status >= 300 && status <= 308;
}

/**
 * Handle what comes back from the API and return either data or errors.
 *
 * Two generic types are passed through:
 *
 * - T is data from the API
 * - E is an error coming back from the API
 *
 * @param resp The fetch response from the API. If this is missing, fetch
 * threw an error and we should send a 500 to the user because the API is
 * probably down.
 */
export async function getApiResponse<T, E = unknown>(
  resp?: Response | void,
): Promise<APIResponse<T, E>> {
  const response: APIResponse<T, E> = {};

  if (!resp) {
    response.error = {
      status: 500,
      message: "API error",
    };

    return response;
  }

  if (isErrorCode(resp.status)) {
    response.error = {
      status: resp.status,
      message: resp.statusText,
      errors: await resp.json(),
    };

    return response;
  }

  // everything worked
  try {
    response.data = await resp.json();
  } catch (e) {
    switch (e.name) {
      case "SyntaxError": // provide more specific error
        response.error = {
          status: 500,
          message: "The API returned invalid JSON"
        }
        break;
      default: // catch-all handling
        response.error = {
          status: 500,
          message: String(e), 
        }
    }
  }
  return response;
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

  if (!resp.ok) {
    throw new Error(resp.statusText);
  }

  // {"location": "s3 URL with credentials"}
  const { location } = await resp.json();

  // if this isn't a valid URL, it's an error
  return new URL(location);
}

export function getCsrfToken(document = globalThis.document): string {
  if (typeof document === "undefined") return "";
  const [key, token] =
    document.cookie
      ?.split(";")
      ?.map((c) => c.split("="))
      // in case there's spaces in the cookie string, trim the key
      ?.find(([k, v]) => k.trim() === CSRF_COOKIE_NAME) ?? [];

  return token;
}
