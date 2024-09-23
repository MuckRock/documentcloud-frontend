import { describe, test, expect, vi } from "vitest";
import {
  isErrorCode,
  isRedirectCode,
  getApiResponse,
  getPrivateAsset,
  getCsrfToken,
} from "../api";

import { CSRF_COOKIE_NAME } from "@/config/config.js";

describe("response code tests", () => {
  test("isErrorCode", () => {
    expect(isErrorCode(200)).toBe(false);
    expect(isErrorCode(204)).toBe(false);
    expect(isErrorCode(301)).toBe(false);
    expect(isErrorCode(307)).toBe(false);
    expect(isErrorCode(400)).toBe(true);
    expect(isErrorCode(404)).toBe(true);
    expect(isErrorCode(500)).toBe(true);
  });

  test("isRedirectCode", () => {
    expect(isRedirectCode(200)).toBe(false);
    expect(isRedirectCode(204)).toBe(false);
    expect(isRedirectCode(301)).toBe(true);
    expect(isRedirectCode(307)).toBe(true);
    expect(isRedirectCode(400)).toBe(false);
    expect(isRedirectCode(404)).toBe(false);
    expect(isRedirectCode(500)).toBe(false);
  });
});

describe("api handling", () => {
  test("getPrivateAsset", async () => {
    const publicUrl = new URL(
      "this-is-private.txt",
      "https://api.www.documentcloud.org",
    );

    const privateUrl = "https://s3.documentcloud.org/this-is-private.txt";
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      if (
        endpoint.toString() === publicUrl.toString() &&
        options.headers.Accept === "application/json"
      ) {
        return {
          ok: true,
          status: 200,
          async json() {
            return {
              location: privateUrl,
            };
          },
        };
      }

      return {
        status: 302,
        headers: {
          Location: privateUrl,
        },
        async json() {},
      };
    });

    const url = await getPrivateAsset(publicUrl, mockFetch);

    expect(url.href).toEqual(privateUrl);
  });

  test("getApiResponse", async () => {
    let resp: Response;

    const body = { test: true };
    const errors = { error: ["This is an error"] };
    resp = new Response(JSON.stringify(body), { status: 200 });

    let response = await getApiResponse(resp);

    expect(response.data).toEqual(body);
    expect(response.error).toBeUndefined();

    resp = new Response(JSON.stringify(errors), { status: 400 });

    response = await getApiResponse(resp);
    expect(response.data).toBeUndefined();
    expect(response.error.status).toEqual(400);
    expect(response.error.errors).toEqual(errors);

    // no response is a 500
    response = await getApiResponse();
    expect(response.data).toBeUndefined();
    expect(response.error.status).toEqual(500);
  });
});

describe("cookie handling", () => {
  test("get csrf token", () => {
    document.cookie = `${CSRF_COOKIE_NAME}=token`;

    expect(getCsrfToken(document)).toStrictEqual("token");
  });
});
