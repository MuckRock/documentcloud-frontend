import { test, expect } from "@playwright/test";

import {
  deleteDocument,
  fetchDoc,
  openModalForm,
  uniqueTitle,
  uploadDocument,
  waitForProcessed,
} from "./helpers/documents";

// A small PDF keeps processing fast.
const FIXTURE = "tests/fixtures/Small pdf.pdf";

// The full document lifecycle as a logged-in user: upload, wait for
// processing, then view → publish → edit metadata → check modes → delete.
test("upload → process → view → publish → check modes → delete", async ({
  page,
  baseURL,
}) => {
  // Cold processing workers can be slow; give the whole flow headroom.
  test.setTimeout(180_000);

  // Accept the "leave page while uploading?" confirm if it ever fires.
  page.on("dialog", (dialog) => dialog.accept());

  const title = uniqueTitle("E2E lifecycle");
  let docApiUrl: string | undefined;
  let deletedViaUi = false;

  try {
    // --- UPLOAD ---------------------------------------------------------
    const uploaded = await uploadDocument(page, { title, fixture: FIXTURE });
    const { id } = uploaded;
    docApiUrl = uploaded.docApiUrl;

    // --- PROCESS --------------------------------------------------------
    const processed = await waitForProcessed(page.request, docApiUrl);

    // --- VIEW -----------------------------------------------------------
    const viewerUrl = `/documents/${id}-${processed.slug}/`;
    await page.goto(viewerUrl);
    await expect(page.locator("h1.title")).toContainText(title);

    // --- VERIFY THE PDF RENDERS -----------------------------------------
    // "document" mode draws each page to a <canvas>; data-loaded flips once
    // pdf.js has rendered.
    await expect(
      page.locator('.page-container[data-loaded="true"]').first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(".pages canvas").first()).toBeVisible();

    // --- MAKE THE DOCUMENT PUBLIC ---------------------------------------
    // The header access badge (reads "Private") is the edit-access trigger.
    const editAccessForm = page.locator('form[action*="?/edit"]');
    await openModalForm(
      page.getByRole("button", { name: "Private", exact: true }),
      editAccessForm,
    );

    // "Public" is a label wrapping a screen-reader-only radio.
    await editAccessForm.locator('label[for="public"]').click();
    await editAccessForm
      .getByRole("button", { name: "Save", exact: true })
      .click();

    // Verify via the API — the header badge lags backend indexing.
    await expect(editAccessForm).toBeHidden({ timeout: 15_000 });
    await expect
      .poll(async () => (await fetchDoc(page, docApiUrl!))?.access, {
        timeout: 15_000,
      })
      .toBe("public");

    // --- EDIT METADATA --------------------------------------------------
    // Reload first so the publish step's in-flight invalidate can't reset the
    // form mid-edit (its fields are bound to the document store).
    await page.goto(viewerUrl);

    const editedTitle = `${title} (edited)`;
    const editForm = page.locator('form[action*="?/edit"]');
    await openModalForm(
      page.getByRole("button", { name: "Edit Document Metadata", exact: true }),
      editForm,
    );
    await editForm.locator('input[name="title"]').fill(editedTitle);
    await editForm
      .locator('textarea[name="description"]')
      .fill("Edited by the lifecycle e2e test.");
    await editForm.getByRole("button", { name: "Save", exact: true }).click();
    await expect(editForm).toBeHidden({ timeout: 15_000 });
    // Verify via the API (the header title lags backend indexing).
    await expect
      .poll(async () => (await fetchDoc(page, docApiUrl!))?.title, {
        timeout: 15_000,
      })
      .toBe(editedTitle);

    // --- TEXT & GRID MODES ----------------------------------------------
    // Only have content if processing produced text + page images. Use the
    // mode query param (the toolbar tabs collapse to a dropdown when narrow).
    await page.goto(`${viewerUrl}?mode=text`);
    await expect(page.locator(".textPages pre").first()).toContainText(
      /small pdf/i,
      { timeout: 15_000 },
    );

    await page.goto(`${viewerUrl}?mode=grid`);
    await expect(page.locator('.pages img[alt*="Page"]').first()).toBeVisible({
      timeout: 15_000,
    });

    // --- DELETE (through the UI) ----------------------------------------
    const confirmForm = page.locator('form[action*="?/delete"]');
    await openModalForm(
      page.getByRole("button", { name: "Delete", exact: true }),
      confirmForm,
    );

    // The modal's submit also reads "Delete"; scope it to the delete form.
    await confirmForm
      .getByRole("button", { name: "Delete", exact: true })
      .click();

    // A single delete navigates to the document list, not the viewer.
    await page.waitForURL((url) => url.pathname === "/documents/", {
      timeout: 30_000,
    });
    deletedViaUi = true;

    await expect
      .poll(async () => (await page.request.get(docApiUrl!)).status(), {
        timeout: 15_000,
      })
      .toBe(404);
  } finally {
    // Safety net: never leave a test document behind.
    if (!deletedViaUi && docApiUrl && baseURL) {
      await deleteDocument(page, docApiUrl, baseURL);
    }
  }
});
