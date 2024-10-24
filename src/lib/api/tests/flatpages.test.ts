import { afterEach, describe, expect, test, vi } from "vitest";

import { BASE_API_URL } from "@/config/config";
import { flatpage } from "@/test/fixtures/flatpages";
import * as flatpages from "../flatpages";

describe("flatpages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("flatpages.get", async () => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 200,
        async json() {
          return flatpage;
        },
      };
    });

    const { error, data } = await flatpages.get(flatpage.url, mockFetch);

    expect(error).toBeUndefined();
    expect(data).toEqual(flatpage);

    expect(mockFetch).toHaveBeenCalledWith(
      new URL("/api/flatpages" + flatpage.url, BASE_API_URL),
      {
        credentials: "include",
      },
    );
  });
});
