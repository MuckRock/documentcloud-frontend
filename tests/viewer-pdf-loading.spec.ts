import { test, expect } from "./helpers/fixtures";
import { expectPdfRendered } from "./helpers/documents";

// #1419: downloading the whole PDF, twice, exhausted memory on large documents.

test.describe("loading the document PDF", () => {
  test("requests the full PDF only once", async ({ page, processedDoc }) => {
    // pdf.js makes one full request to learn the file's size, then switches to
    // ranges where the server allows them.
    const fullRequests: string[] = [];
    page.on("response", (response) => {
      const type = response.headers()["content-type"] ?? "";
      if (
        type.includes("application/pdf") &&
        !response.request().headers().range
      ) {
        fullRequests.push(response.url());
      }
    });

    await page.goto(processedDoc.viewerUrl);
    await expectPdfRendered(page);
    await page.waitForLoadState("networkidle");

    expect(fullRequests).toHaveLength(1);
  });
});
