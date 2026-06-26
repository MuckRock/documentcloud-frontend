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
   * A freshly uploaded, fully processed throwaway document, deleted in teardown
   * (which Playwright runs even on failure). Tests that assert on the title
   * should upload their own instead, to control it.
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
