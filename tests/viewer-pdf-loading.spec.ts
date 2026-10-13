import { test, expect } from "./helpers/fixtures";
import { expectPdfRendered } from "./helpers/documents";

// #1419: downloading the whole PDF, twice, exhausted memory on large documents.

test.describe("loading the document PDF", () => {
  test("loads a private document by byte range, never the whole file", async ({
    page,
    processedDoc,
  }) => {
    // Uploads are private. Needs the bucket's CORS to expose Content-Range.
    const full: string[] = [];
    const ranges: string[] = [];
    page.on("response", (response) => {
      const type = response.headers()["content-type"] ?? "";
      if (!type.includes("application/pdf")) return;
      if (response.request().headers().range) ranges.push(response.url());
      else full.push(response.url());
    });

    await page.goto(processedDoc.viewerUrl);
    await expectPdfRendered(page);
    await page.waitForLoadState("networkidle");

    expect(full).toHaveLength(0);
    expect(ranges.length).toBeGreaterThan(0);
  });
});
