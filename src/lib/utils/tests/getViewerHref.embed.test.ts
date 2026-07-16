/**
 * Guards that viewer links built inside an embed resolve to EMBED_URL, not
 * APP_URL.
 *
 * The default dev config sets EMBED_URL === APP_URL, which is exactly why a
 * missing `embed` flag can slip through unnoticed (the hosts look identical
 * everywhere except staging/production). Here we mock the config so the two
 * hosts differ, then assert which host `getViewerHref` uses for each case.
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/config/config.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/config/config.js")>()),
  APP_URL: "https://www.documentcloud.org/",
  EMBED_URL: "https://embed.documentcloud.org/",
}));

import { getViewerHref } from "../viewer";
import { document } from "@/test/fixtures/documents";

describe("getViewerHref host", () => {
  it("uses EMBED_URL for document links when embed is true", () => {
    const href = getViewerHref({ document, embed: true });
    expect(new URL(href).host).toBe("embed.documentcloud.org");
  });

  it("uses APP_URL for document links when embed is false", () => {
    const href = getViewerHref({ document, embed: false });
    expect(new URL(href).host).toBe("www.documentcloud.org");
  });
});
