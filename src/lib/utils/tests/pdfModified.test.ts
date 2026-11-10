import { afterEach, describe, expect, it, vi } from "vitest";

import { pdfModified } from "$lib/utils/pdfModified";

const url = new URL("https://example.com/doc.pdf");

describe("pdfModified", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads Last-Modified from a one-byte range request", async () => {
    const modified = "Tue, 10 Nov 2026 21:03:47 GMT";
    const fetch = vi.fn(
      async (_url: URL, _init?: RequestInit) =>
        new Response("%", {
          status: 206,
          headers: { "Last-Modified": modified },
        }),
    );
    vi.stubGlobal("fetch", fetch);

    expect(await pdfModified(url)).toBe(modified);
    expect(fetch.mock.calls[0]![1]!.headers).toEqual({ Range: "bytes=0-0" });
  });

  it("is null when the request is refused", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(null, {
            status: 403,
            headers: { "Last-Modified": "Tue, 10 Nov 2026 21:03:47 GMT" },
          }),
      ),
    );

    expect(await pdfModified(url)).toBeNull();
  });

  it("is null when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));

    expect(await pdfModified(url)).toBeNull();
  });
});
