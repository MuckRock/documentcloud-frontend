import { test as base } from "@playwright/test";

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

interface Fixtures {
  /**
   * A freshly uploaded, fully processed throwaway document. Deleted in teardown
   * (via the API) so tests never leave one behind — Playwright runs teardown
   * even when the test fails. Use for any test that just needs a document to
   * operate on; tests that assert on the title should upload their own so they
   * control it.
   */
  processedDoc: ProcessedDoc;
}

const FIXTURE = "tests/fixtures/Small pdf.pdf";

export const test = base.extend<Fixtures>({
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
});

export { expect } from "@playwright/test";
