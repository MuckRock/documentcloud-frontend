import { test, expect } from "@playwright/test";

import {
  deleteDocument,
  uniqueTitle,
  waitForProcessed,
} from "./helpers/documents";

// A small PDF keeps processing fast.
const FIXTURE = "tests/fixtures/Small pdf.pdf";

// The full document lifecycle, as a logged-in user experiences it: upload a
// document, wait for it to finish processing, verify it views correctly, then
// delete it. Runs in the `authenticated` project (reuses the saved session);
// skipped automatically when no test credentials are configured.
//
// This is the skeleton — more steps (editing metadata, notes, sharing, …) will
// slot in between "view" and "delete" later.
test("upload → process → view → delete", async ({ page, baseURL }) => {
  // Cold processing workers can be slow; give the whole flow headroom.
  test.setTimeout(180_000);

  // Accept the "leave page while uploading?" confirm if it ever fires.
  page.on("dialog", (dialog) => dialog.accept());

  const title = uniqueTitle("E2E lifecycle");
  let docApiUrl: string | undefined;
  let deletedViaUi = false;

  try {
    // --- UPLOAD ---------------------------------------------------------
    await page.goto("/upload/");

    // "Select Files" is disabled until the component has hydrated and read the
    // CSRF token, so waiting for it to enable also ensures the file-picker
    // handler is wired up before we open it.
    const selectFiles = page.getByRole("button", {
      name: "Select Files",
      exact: true,
    });
    await expect(selectFiles).toBeEnabled();

    // Drive the real file chooser rather than poking the hidden <input>, so the
    // component's onchange handler actually runs and registers the file.
    const fileChooser = page.waitForEvent("filechooser");
    await selectFiles.click();
    await (await fileChooser).setFiles(FIXTURE);

    // Give our document the unique title so later steps can identify it.
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible();
    await titleInput.fill(title);

    // The upload happens client-side, hitting the API directly. Capture the
    // create call (POST .../api/documents/) to learn the new document's id.
    const createResponse = page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        /\/documents\/$/.test(new URL(r.url()).pathname),
    );

    await page
      .getByRole("button", { name: "Begin Upload", exact: true })
      .click();

    const created = await createResponse;
    expect(created.ok()).toBeTruthy();
    const { id } = await created.json();
    expect(id, "create response should include a document id").toBeTruthy();

    // Derive the document API URL from the create endpoint so we don't have to
    // hardcode the API host (it differs between dev / staging / previews).
    docApiUrl = created.url().replace(/\/documents\/$/, `/documents/${id}/`);

    // --- PROCESS --------------------------------------------------------
    const processed = await waitForProcessed(page.request, docApiUrl);

    // --- VIEW -----------------------------------------------------------
    await page.goto(`/documents/${id}-${processed.slug}/`);
    await expect(page.locator("h1.title")).toContainText(title);
    // At least one page should render in the viewer.
    await expect(page.locator(".page").first()).toBeVisible({
      timeout: 30_000,
    });

    // --- DELETE (through the UI) ----------------------------------------
    // Open the confirmation from the viewer sidebar. The sidebar's onclick
    // only fires once the viewer has hydrated, so retry the click until the
    // confirmation modal actually appears (a pre-hydration click just focuses
    // the button and is a no-op).
    const confirmForm = page.locator('form[action*="?/delete"]');
    await expect(async () => {
      await page.getByRole("button", { name: "Delete", exact: true }).click();
      await expect(confirmForm).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 20_000 });

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
