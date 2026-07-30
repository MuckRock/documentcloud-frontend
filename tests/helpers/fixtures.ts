import { test as base } from "@playwright/test";

import { STORAGE_STATE, baseURL } from "../../playwright.config";
import {
  deleteDocument,
  uniqueTitle,
  uploadDocument,
  waitForProcessed,
} from "./documents";

export interface ProcessedDoc {
  id: number;
  /** Document detail API URL, e.g. `…/api/documents/123/`. */
  docApiUrl: string;
  /** Viewer route, e.g. `/documents/123-slug/`. */
  viewerUrl: string;
}

export interface MultiPageDoc extends ProcessedDoc {
  /** How many pages the document has, for tests that deep link into it. */
  pageCount: number;
}

interface Fixtures {
  /**
   * A freshly uploaded, fully processed throwaway document, deleted in teardown
   * (which Playwright runs even on failure). Tests that assert on the title
   * should upload their own instead, to control it.
   */
  processedDoc: ProcessedDoc;
}

interface WorkerFixtures {
  /**
   * A processed document with enough pages to deep link into, uploaded once per
   * worker and shared — processing a multi-page upload is slow.
   */
  multiPageDoc: MultiPageDoc;
}

const FIXTURE = "tests/fixtures/Small pdf.pdf";
const MULTIPAGE_FIXTURE = "tests/fixtures/the-nature-of-the-firm-CPEC11.pdf";
const MULTIPAGE_PAGE_COUNT = 17;

export const test = base.extend<Fixtures, WorkerFixtures>({
  processedDoc: async ({ page, baseURL }, use) => {
    const { id, docApiUrl } = await uploadDocument(page, {
      title: uniqueTitle("E2E"),
      fixture: FIXTURE,
    });
    const processed = await waitForProcessed(page.request, docApiUrl);
    const viewerUrl = `/documents/${id}-${processed.slug}/`;

    await use({ id, docApiUrl, viewerUrl });

    if (baseURL) await deleteDocument(page, docApiUrl, baseURL);
  },

  multiPageDoc: [
    async ({ browser }, use) => {
      // Worker fixtures can't use the test-scoped `page`, and uploading goes
      // through the UI, so drive a page of our own on the saved session.
      const context = await browser.newContext({ storageState: STORAGE_STATE });
      const page = await context.newPage();

      try {
        const { id, docApiUrl } = await uploadDocument(page, {
          title: uniqueTitle("E2E multipage"),
          fixture: MULTIPAGE_FIXTURE,
        });
        const processed = await waitForProcessed(page.request, docApiUrl);

        await use({
          id,
          docApiUrl,
          viewerUrl: `/documents/${id}-${processed.slug}/`,
          pageCount: MULTIPAGE_PAGE_COUNT,
        });

        await deleteDocument(page, docApiUrl, baseURL);
      } finally {
        await context.close();
      }
    },
    // Uploading and processing 17 pages runs well past the 30s default.
    { scope: "worker", timeout: 240_000 },
  ],
});

export { expect } from "@playwright/test";
