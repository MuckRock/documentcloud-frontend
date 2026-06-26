import { test, expect } from "./helpers/fixtures";
import {
  drawBox,
  expectPdfRendered,
  fetchDoc,
  openModalForm,
  waitForProcessed,
} from "./helpers/documents";

// Document operations that re-trigger processing: redacting and reprocessing.
// Each test gets a fresh document from the `processedDoc` fixture, which also
// deletes it in teardown.

test("redact a document", async ({ page, processedDoc }) => {
  // Redaction reprocesses the document, so budget for two processing waits.
  test.setTimeout(180_000);
  // Accept the "unsaved redactions" leave prompt if it ever fires.
  page.on("dialog", (dialog) => dialog.accept());

  const { docApiUrl, viewerUrl } = processedDoc;

  // Render first so the redaction layer is sized.
  await page.goto(`${viewerUrl}?mode=redacting`);
  await expectPdfRendered(page);

  // The layer's pointer handlers attach on hydration, so retry the drag until a
  // redaction box actually registers.
  const layer = page.locator('.redactions.active[role="application"]').first();
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
  // A success result means the drawn box serialized and the API accepted it.
  expect(await redactResult.text()).toContain('"type":"success"');

  // Redacting kicks the document back into processing, so it leaves "success".
  // We don't wait for it to finish: redaction reprocessing errors on the dev
  // backend (infra, not a frontend concern) — submitting the redaction is what's
  // under test.
  await expect
    .poll(async () => (await fetchDoc(page, docApiUrl))?.status, {
      timeout: 30_000,
    })
    .not.toBe("success");
});

test("reprocess a document", async ({ page, processedDoc }) => {
  test.setTimeout(180_000);

  const { docApiUrl, viewerUrl } = processedDoc;

  await page.goto(viewerUrl);

  // Open the Reprocess modal from the sidebar. Identify it by the force-OCR
  // checkbox (the sidebar trigger and the modal's confirm both read
  // "Reprocess").
  const reprocessForm = page.locator('form:has(input[name="force_ocr"])');
  await openModalForm(
    page.getByRole("button", { name: "Reprocess", exact: true }),
    reprocessForm,
  );

  // Confirm with defaults — a plain reprocess (forcing OCR errors on the dev
  // backend). This posts directly to the process API from the browser.
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
});
