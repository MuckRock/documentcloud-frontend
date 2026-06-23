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

// The full document lifecycle, as a logged-in user experiences it: upload a
// document, wait for it to finish processing, confirm the PDF renders, make it
// public, check that text and grid modes work (which proves processing
// produced text and page images), then delete it. Runs in the `authenticated`
// project (reuses the saved session); skipped automatically when no test
// credentials are configured.
//
// More steps (notes, sharing, …) can slot in before the delete later.
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
    // The default ("document") mode draws each page to a <canvas> via pdf.js;
    // a page-container flips `data-loaded` once it has actually rendered.
    await expect(
      page.locator('.page-container[data-loaded="true"]').first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(".pages canvas").first()).toBeVisible();

    // --- MAKE THE DOCUMENT PUBLIC ---------------------------------------
    // The access badge in the header doubles as the edit-access trigger and
    // currently reads "Private".
    const editAccessForm = page.locator('form[action*="?/edit"]');
    await openModalForm(
      page.getByRole("button", { name: "Private", exact: true }),
      editAccessForm,
    );

    // Pick "Public" (a label wrapping a screen-reader-only radio) and save.
    await editAccessForm.locator('label[for="public"]').click();
    await editAccessForm
      .getByRole("button", { name: "Save", exact: true })
      .click();

    // A successful save closes the modal. Verify the change via the API: the
    // header badge can lag behind backend indexing, but the document detail
    // endpoint reflects the new access immediately.
    await expect(editAccessForm).toBeHidden({ timeout: 15_000 });
    await expect
      .poll(async () => (await fetchDoc(page, docApiUrl!))?.access, {
        timeout: 15_000,
      })
      .toBe("public");

    // --- EDIT METADATA --------------------------------------------------
    // Reload first: the publish step's background invalidate would otherwise
    // land mid-edit and reset the form fields (they're bound to the document
    // store), clobbering our input. A fresh load means no reload is in flight.
    await page.goto(viewerUrl);

    // The sidebar's "Edit Document Metadata" opens the full editor. Change the
    // title and description.
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
    // Both modes only have content if processing succeeded: text mode shows
    // the extracted text, grid mode shows a thumbnail per generated page
    // image. Switch via the `mode` query param (the toolbar collapses to a
    // dropdown at narrow widths, so a URL is more robust than clicking tabs).
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
    // Open the confirmation from the viewer sidebar.
    const confirmForm = page.locator('form[action*="?/delete"]');
    await openModalForm(
      page.getByRole("button", { name: "Delete", exact: true }),
      confirmForm,
    );

    // Confirm via the submit scoped inside the delete form (the modal's submit
    // button also reads "Delete").
    await confirmForm
      .getByRole("button", { name: "Delete", exact: true })
      .click();

    // A single delete navigates to the user's document list (not the viewer).
    await page.waitForURL((url) => url.pathname === "/documents/", {
      timeout: 30_000,
    });
    deletedViaUi = true;

    // The document should now be gone from the API.
    await expect
      .poll(async () => (await page.request.get(docApiUrl!)).status(), {
        timeout: 15_000,
      })
      .toBe(404);
  } finally {
    // Safety net: never leave a test document behind, even if the UI flow
    // failed before the delete step ran.
    if (!deletedViaUi && docApiUrl && baseURL) {
      await deleteDocument(page, docApiUrl, baseURL);
    }
  }
});
