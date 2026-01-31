import { afterEach, vi, test as base, describe, expect } from "vitest";

import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";

import * as kv from "../kv";
import type { Data, Document } from "../types";

type Use<T> = (value: T) => Promise<void>;

const test = base.extend({
  async document({}, use: Use<Document>) {
    const document =
      await import("@/test/fixtures/documents/document-expanded.json");

    await use(document as Document);
  },

  async keyValues({}, use: Use<string[]>) {
    await use(["Author", "Location", "Genre"]);
  },

  async dataResponse({}, use: Use<Data>) {
    await use({
      _tag: ["Environment", "California"],
      Author: ["Joan Didion"],
    });
  },
});

const csrf_token = "token";

describe("reading key-value data", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("kv.get - fetch values for a key", async ({ document, keyValues }) => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        async json() {
          return keyValues;
        },
      };
    });

    const key = "Author";
    const { data: result, error } = await kv.get(document, key, mockFetch);

    expect(error).toBeUndefined();
    expect(result).toEqual(keyValues);
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/data/${key}/`, BASE_API_URL),
      {
        credentials: "include",
      },
    );
  });

  test("kv.get - handles fetch error", async ({ document }) => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      throw new Error("Network error");
    });

    const { data, error } = await kv.get(document, "testKey", mockFetch);

    expect(data).toBeUndefined();
    expect(error).toBeDefined();
  });
});

describe("writing key-value data", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("kv.set - set values for a key", async ({
    document,
    keyValues,
    dataResponse,
  }) => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        async json() {
          return dataResponse;
        },
      };
    });

    const key = "Author";
    const { data: result, error } = await kv.set(
      document,
      key,
      keyValues,
      csrf_token,
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(result).toEqual(dataResponse);
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/data/${key}/`, BASE_API_URL),
      {
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf_token,
          Referer: APP_URL,
        },
        body: JSON.stringify({ values: keyValues }),
      },
    );
  });

  test("kv.set - handles validation errors", async ({ document }) => {
    const validationError = {
      values: ["This field is required"],
    };

    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        ok: false,
        status: 400,
        statusText: "Bad Request",
        async json() {
          return validationError;
        },
      };
    });

    const { data, error } = await kv.set(
      document,
      "testKey",
      [],
      csrf_token,
      mockFetch,
    );

    expect(data).toBeUndefined();
    expect(error).toBeDefined();
    expect(error?.status).toBe(400);
    expect(error?.errors).toEqual(validationError);
  });

  test("kv.update - add values to a key", async ({
    document,
    keyValues,
    dataResponse,
  }) => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        async json() {
          return dataResponse;
        },
      };
    });

    const key = "Author";
    const { data: result, error } = await kv.update(
      document,
      key,
      keyValues,
      undefined,
      csrf_token,
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(result).toEqual(dataResponse);
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/data/${key}/`, BASE_API_URL),
      {
        credentials: "include",
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf_token,
          Referer: APP_URL,
        },
        body: JSON.stringify({ values: keyValues }),
      },
    );
  });

  test("kv.update - remove values from a key", async ({
    document,
    dataResponse,
  }) => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        async json() {
          return dataResponse;
        },
      };
    });

    const key = "Author";
    const removeValues = ["value2"];
    const { data: result, error } = await kv.update(
      document,
      key,
      undefined,
      removeValues,
      csrf_token,
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(result).toEqual(dataResponse);
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/data/${key}/`, BASE_API_URL),
      {
        credentials: "include",
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf_token,
          Referer: APP_URL,
        },
        body: JSON.stringify({ remove: removeValues }),
      },
    );
  });

  test("kv.update - add and remove values simultaneously", async ({
    document,
    dataResponse,
  }) => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        status: 200,
        async json() {
          return dataResponse;
        },
      };
    });

    const key = "Author";
    const addValues = ["value4", "value5"];
    const removeValues = ["value1"];

    const { data: result, error } = await kv.update(
      document,
      key,
      addValues,
      removeValues,
      csrf_token,
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(result).toEqual(dataResponse);
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/data/${key}/`, BASE_API_URL),
      {
        credentials: "include",
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf_token,
          Referer: APP_URL,
        },
        body: JSON.stringify({ values: addValues, remove: removeValues }),
      },
    );
  });

  test("kv.update - handles empty arrays", async ({
    document,
    dataResponse,
  }) => {
    const mockFetch = vi.fn().mockImplementation(async (_endpoint, options) => {
      const body = JSON.parse(options.body);

      // Verify empty arrays are excluded from the body
      expect(body).not.toHaveProperty("values");
      expect(body).not.toHaveProperty("remove");

      return {
        ok: true,
        status: 200,
        async json() {
          return dataResponse;
        },
      };
    });

    const key = "Author";
    const { data: result, error } = await kv.update(
      document,
      key,
      [],
      [],
      csrf_token,
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(result).toEqual(dataResponse);
  });

  test("kv.update - handles undefined values", async ({
    document,
    dataResponse,
  }) => {
    const mockFetch = vi.fn().mockImplementation(async (_endpoint, options) => {
      const body = JSON.parse(options.body);

      // Verify undefined values don't appear in the body
      expect(body).not.toHaveProperty("values");
      expect(body).not.toHaveProperty("remove");

      return {
        ok: true,
        status: 200,
        async json() {
          return dataResponse;
        },
      };
    });

    const key = "Author";
    const { data: result, error } = await kv.update(
      document,
      key,
      undefined,
      undefined,
      csrf_token,
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(result).toEqual(dataResponse);
  });

  test("kv.update - handles fetch error", async ({ document }) => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      throw new Error("Network error");
    });

    const { data, error } = await kv.update(
      document,
      "testKey",
      ["value1"],
      undefined,
      csrf_token,
      mockFetch,
    );

    expect(data).toBeUndefined();
    expect(error).toBeDefined();
  });
});

describe("kv utils", () => {
  test("kv.keys empty", ({ document }) => {
    const keys = kv.keys([document]);
    expect(keys).toEqual(new Set());
  });

  test("kv.keys", ({ document, dataResponse }) => {
    const keys = kv.keys([document, { ...document, data: dataResponse }]);

    expect(keys).toEqual(new Set(["Author", "_tag"]));
  });

  test("kv.common empty", ({ document }) => {
    // give nothing, get nothing
    expect(kv.common([document])).toEqual({});
  });

  test("kv.common one empty", ({ document, dataResponse }) => {
    // one is empty, so there's no intersection
    const common = kv.common([document, { ...document, data: dataResponse }]);

    expect(common).toEqual({});
  });

  test("kv.common _tags", ({ document, dataResponse }) => {
    const common = kv.common([
      { ...document, data: { _tag: ["Environment"] } },
      { ...document, data: dataResponse },
    ]);

    expect(common).toEqual({ _tag: ["Environment"] });
  });

  test("kv.common data", ({ document, dataResponse }) => {
    const common = kv.common([
      { ...document, data: { _tag: ["Environment"], Author: ["Joan Didion"] } },
      { ...document, data: dataResponse },
    ]);

    expect(common).toEqual({ _tag: ["Environment"], Author: ["Joan Didion"] });
  });
});
