import { test, expect } from "@playwright/test";

import {
  deleteDocument,
  drawBox,
  fetchDoc,
  openModalForm,
  uniqueTitle,
  uploadDocument,
  waitForProcessed,
} from "./helpers/documents";

// Document operations that re-trigger processing: redacting and reprocessing.
// Each test is self-contained — it uploads its own throwaway document and
// deletes it in `finally` — and runs in the `authenticated` project. Skipped
// automatically when no test credentials are configured.

const FIXTURE = "tests/fixtures/Small pdf.pdf";

test("redact a document", async ({ page, baseURL }) => {
  // Redaction reprocesses the document, so budget for two processing waits.
  test.setTimeout(180_000);
  // Accept the "unsaved redactions" leave prompt if it ever fires.
  page.on("dialog", (dialog) => dialog.accept());

  let docApiUrl: string | undefined;

  try {
    const { id, docApiUrl: url } = await uploadDocument(page, {
      title: uniqueTitle("E2E redact"),
      fixture: FIXTURE,
    });
    docApiUrl = url;
    const processed = await waitForProcessed(page.request, docApiUrl);
    const viewerUrl = `/documents/${id}-${processed.slug}/`;

    // Enter redacting mode and wait for the page to render so the redaction
    // layer is sized.
    await page.goto(`${viewerUrl}?mode=redacting`);
    await expect(
      page.locator('.page-container[data-loaded="true"]').first(),
    ).toBeVisible({ timeout: 30_000 });

    // Draw a redaction box. The layer's pointer handlers attach on hydration,
    // so retry the drag until a redaction box actually registers.
    const layer = page
      .locator('.redactions.active[role="application"]')
      .first();
    await expect(layer).toBeVisible();
    await expect(async () => {
      await drawBox(page, layer);
      await expect(page.locator(".redaction").first()).toBeVisible({
        timeout: 1_000,
      });
    }).toPass({ timeout: 20_000 });

    // The toolbar "Save" opens a confirmation modal whose form posts to
    // `?/redact`; confirm there.
    const redactForm = page.locator('form[action*="?/redact"]');
    await openModalForm(
      page.getByRole("button", { name: "Save", exact: true }),
      redactForm,
    );
    const redactResponse = page.waitForResponse(
      (r) => r.url().includes("?/redact") && r.request().method() === "POST",
    );
    await redactForm.getByRole("button", { name: "Save", exact: true }).click();
    const redactResult = await redactResponse;
    expect(redactResult.ok()).toBeTruthy();
    // The action echoes the saved redactions back; a success result means the
    // drawn box serialized and the API accepted it.
    expect(await redactResult.text()).toContain('"type":"success"');

    // Redacting sends the document back through the pipeline, so it leaves the
    // "success" state. We don't wait for it to finish: redaction reprocessing
    // errors on the dev backend (an infra limitation, not a frontend concern) —
    // the submitted redaction above is the behavior under test.
    await expect
      .poll(async () => (await fetchDoc(page, docApiUrl!))?.status, {
        timeout: 30_000,
      })
      .not.toBe("success");
  } finally {
    if (docApiUrl && baseURL) await deleteDocument(page, docApiUrl, baseURL);
  }
});

test("reprocess a document", async ({ page, baseURL }) => {
  test.setTimeout(180_000);

  let docApiUrl: string | undefined;

  try {
    const { id, docApiUrl: url } = await uploadDocument(page, {
      title: uniqueTitle("E2E reprocess"),
      fixture: FIXTURE,
    });
    docApiUrl = url;
    const processed = await waitForProcessed(page.request, docApiUrl);
    const viewerUrl = `/documents/${id}-${processed.slug}/`;

    await page.goto(viewerUrl);

    // Open the Reprocess modal from the sidebar. Identify it by the force-OCR
    // checkbox (the sidebar trigger and the modal's confirm both read
    // "Reprocess").
    const reprocessForm = page.locator('form:has(input[name="force_ocr"])');
    await openModalForm(
      page.getByRole("button", { name: "Reprocess", exact: true }),
      reprocessForm,
    );

    // Confirm with the default options. (Forcing OCR on this fixture errors on
    // the dev backend, so a plain reprocess is the reliable path.) This posts
    // directly to the process API from the browser.
    const processResponse = page.waitForResponse(
      (r) =>
        r.url().includes("/documents/process/") &&
        r.request().method() === "POST",
    );
    await reprocessForm
      .getByRole("button", { name: "Reprocess", exact: true })
      .click();
    expect((await processResponse).ok()).toBeTruthy();

    // Reprocessing cycles the document back through pending to success.
    await waitForProcessed(page.request, docApiUrl);
  } finally {
    if (docApiUrl && baseURL) await deleteDocument(page, docApiUrl, baseURL);
  }
});
