import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Mutable mock of the private env so we can toggle configuration per test.
// Defined via vi.hoisted so it exists when the hoisted vi.mock factory runs.
const { mockEnv } = vi.hoisted(() => ({
  mockEnv: {} as Record<string, string | undefined>,
}));
vi.mock("$env/dynamic/private", () => ({ env: mockEnv }));

import {
  getTrendingDocumentIds,
  parseTrendingDocumentIds,
} from "../cloudflare";

function group(clientRequestPath: string, count: number) {
  return { count, dimensions: { clientRequestPath } };
}

describe("parseTrendingDocumentIds", () => {
  test("keeps canonical document paths and extracts the id", () => {
    const ids = parseTrendingDocumentIds([
      group("/documents/2621-mueller-report/", 100),
      group("/documents/42-some-slug/", 50),
    ]);

    expect(ids).toEqual(["2621", "42"]);
  });

  test("rejects non-document paths", () => {
    const ids = parseTrendingDocumentIds([
      group("/", 100),
      group("/projects/123-foo/", 90),
      group("/documents/", 80),
      group("/documents/search/", 70),
      group("/help/api/", 60),
    ]);

    expect(ids).toEqual([]);
  });

  test("preserves descending-count order from Cloudflare", () => {
    const ids = parseTrendingDocumentIds([
      group("/documents/9-c/", 300),
      group("/documents/5-a/", 200),
      group("/documents/7-b/", 100),
    ]);

    expect(ids).toEqual(["9", "5", "7"]);
  });

  test("de-dupes ids while keeping first occurrence", () => {
    const ids = parseTrendingDocumentIds([
      group("/documents/5-a/", 300),
      group("/documents/5-a-different-slug/", 200),
      group("/documents/6-b/", 100),
    ]);

    expect(ids).toEqual(["5", "6"]);
  });

  test("tolerates malformed groups", () => {
    const ids = parseTrendingDocumentIds([
      // @ts-expect-error missing dimensions
      { count: 10 },
      group("/documents/8-ok/", 5),
    ]);

    expect(ids).toEqual(["8"]);
  });
});

describe("getTrendingDocumentIds", () => {
  beforeEach(() => {
    mockEnv.CLOUDFLARE_ANALYTICS_TOKEN = "test-token";
    mockEnv.CLOUDFLARE_ANALYTICS_ZONE_TAG = "test-zone";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete mockEnv.CLOUDFLARE_ANALYTICS_TOKEN;
    delete mockEnv.CLOUDFLARE_ANALYTICS_ZONE_TAG;
  });

  test("returns [] when not configured", async () => {
    delete mockEnv.CLOUDFLARE_ANALYTICS_TOKEN;
    const fetch = vi.fn();

    expect(await getTrendingDocumentIds(fetch)).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  test("queries Cloudflare and parses the response", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return {
          data: {
            viewer: {
              zones: [
                {
                  httpRequestsAdaptiveGroups: [
                    group("/documents/2621-mueller-report/", 100),
                    group("/", 999),
                    group("/documents/42-foo/", 50),
                  ],
                },
              ],
            },
          },
        };
      },
    });

    const ids = await getTrendingDocumentIds(fetch);

    expect(ids).toEqual(["2621", "42"]);
    const [url, options] = fetch.mock.calls[0]!;
    expect(url).toContain("api.cloudflare.com");
    expect(options.headers.Authorization).toBe("Bearer test-token");
  });

  test("returns [] on a non-ok response", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, async json() {} });
    expect(await getTrendingDocumentIds(fetch)).toEqual([]);
  });

  test("returns [] when GraphQL reports errors", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      async json() {
        return { errors: [{ message: "nope" }], data: null };
      },
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await getTrendingDocumentIds(fetch)).toEqual([]);
  });

  test("returns [] when the request throws", async () => {
    const fetch = vi.fn().mockRejectedValue(new Error("network"));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await getTrendingDocumentIds(fetch)).toEqual([]);
  });
});
