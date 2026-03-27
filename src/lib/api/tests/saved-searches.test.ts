import type { SavedSearch, SavedSearchResults } from "../types";

import { vi, describe, test, expect, afterEach } from "vitest";
import { BASE_API_URL, CSRF_HEADER_NAME, APP_URL } from "@/config/config.js";

import * as savedSearches from "../saved-searches";
import {
  savedSearch,
  savedSearchPage,
  emptySavedSearchPage,
} from "@/test/fixtures/saved-searches";

function mockFetchJson(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Bad Request",
    async json() {
      return data;
    },
  });
}

describe("saved searches API", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("list returns paginated results", async () => {
    const mockFetch = mockFetchJson(savedSearchPage);

    const { data, error } = await savedSearches.list(mockFetch);

    expect(error).toBeUndefined();
    expect(data).toStrictEqual(savedSearchPage);
    expect(mockFetch).toBeCalledWith(
      new URL("documents/search/saved/", BASE_API_URL),
      { credentials: "include" },
    );
  });

  test("list handles error response", async () => {
    const mockFetch = mockFetchJson({ detail: "Not authenticated" }, 403);

    const { data, error } = await savedSearches.list(mockFetch);

    expect(data).toBeUndefined();
    expect(error).toBeDefined();
    expect(error?.status).toBe(403);
  });

  test("listAll returns flat array", async () => {
    const mockFetch = mockFetchJson(savedSearchPage);

    const results = await savedSearches.listAll(mockFetch);

    expect(results).toStrictEqual(savedSearchPage.results);
  });

  test("listAll returns empty array when no results", async () => {
    const mockFetch = mockFetchJson(emptySavedSearchPage);

    const results = await savedSearches.listAll(mockFetch);

    expect(results).toStrictEqual([]);
  });

  test("create sends POST with name and query", async () => {
    const created = { ...savedSearch, uuid: "new-uuid" };
    const mockFetch = mockFetchJson(created, 201);
    const csrf = "test-csrf-token";

    const { data, error } = await savedSearches.create(
      { name: "Test Search", query: "test query" },
      csrf,
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(data).toStrictEqual(created);
    expect(mockFetch).toBeCalledWith(
      new URL("documents/search/saved/", BASE_API_URL),
      {
        body: JSON.stringify({ name: "Test Search", query: "test query" }),
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf,
          Referer: APP_URL,
        },
        method: "POST",
      },
    );
  });

  test("create handles validation error", async () => {
    const mockFetch = mockFetchJson({ name: ["This field is required."] }, 400);

    const { data, error } = await savedSearches.create(
      { name: "", query: "test" },
      "csrf",
      mockFetch,
    );

    expect(data).toBeUndefined();
    expect(error).toBeDefined();
    expect(error?.status).toBe(400);
  });

  test("update sends PATCH with uuid", async () => {
    const updated = { ...savedSearch, name: "Updated Name" };
    const mockFetch = mockFetchJson(updated);
    const csrf = "test-csrf-token";

    const { data, error } = await savedSearches.update(
      savedSearch.uuid,
      { name: "Updated Name" },
      csrf,
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(data).toStrictEqual(updated);
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/search/saved/${savedSearch.uuid}/`, BASE_API_URL),
      {
        body: JSON.stringify({ name: "Updated Name" }),
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf,
          Referer: APP_URL,
        },
        method: "PATCH",
      },
    );
  });

  test("destroy sends DELETE with uuid", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      statusText: "No Content",
      async json() {
        return null;
      },
    });
    const csrf = "test-csrf-token";

    const { error } = await savedSearches.destroy(
      savedSearch.uuid,
      csrf,
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/search/saved/${savedSearch.uuid}/`, BASE_API_URL),
      {
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf,
          Referer: APP_URL,
        },
        method: "DELETE",
      },
    );
  });

  test("destroy handles 404 error", async () => {
    const mockFetch = mockFetchJson({ detail: "Not found." }, 404);

    const { error } = await savedSearches.destroy(
      "nonexistent-uuid",
      "csrf",
      mockFetch,
    );

    expect(error).toBeDefined();
    expect(error?.status).toBe(404);
  });
});
