import { test, expect, type Page } from "@playwright/test";

import {
  deleteDocument,
  drawBox,
  uniqueTitle,
  uploadDocument,
  waitForProcessed,
} from "./helpers/documents";

// The note lifecycle, as a logged-in user experiences it on the document
// viewer: create a note by drawing on the page, edit it, change its access,
// then delete it. Notes are created/updated/deleted by direct API calls from
// the browser, so each step is verified through that call's response. Runs in
// the `authenticated` project; skipped when no test credentials are configured.

const FIXTURE = "tests/fixtures/Small pdf.pdf";

/**
 * Open the (single) existing note for editing in annotating mode by clicking
 * its margin tab, retrying until the edit form appears (the tab's handler only
 * fires once the viewer has hydrated). Returns the note form locator.
 */
async function openNoteForEditing(page: Page) {
  const noteForm = page.locator(".note.card form");
  await expect(async () => {
    await page.locator("a.note-tab").first().click();
    await expect(noteForm.locator('input[name="title"]')).toBeVisible({
      timeout: 2_000,
    });
  }).toPass({ timeout: 20_000 });
  return noteForm;
}

test("create → edit → change access → delete a note", async ({
  page,
  baseURL,
}) => {
  test.setTimeout(180_000);

  const noteTitle = uniqueTitle("E2E note");
  const editedNoteTitle = `${noteTitle} (edited)`;
  let docApiUrl: string | undefined;

  try {
    const { id, docApiUrl: url } = await uploadDocument(page, {
      title: uniqueTitle("E2E note doc"),
      fixture: FIXTURE,
    });
    docApiUrl = url;
    const processed = await waitForProcessed(page.request, docApiUrl);
    const viewerUrl = `/documents/${id}-${processed.slug}/`;
    const notesUrl = `${docApiUrl}notes/`;

    // --- CREATE ---------------------------------------------------------
    await page.goto(`${viewerUrl}?mode=annotating`);
    await expect(
      page.locator('.page-container[data-loaded="true"]').first(),
    ).toBeVisible({ timeout: 30_000 });

    // Drag a region on the first page to open the new-note form. The layer's
    // pointer handlers attach on hydration, so retry until the form appears.
    const noteForm = page.locator(".note.card form");
    const layer = page.locator('.notes[role="application"]').first();
    await expect(async () => {
      await drawBox(page, layer);
      await expect(noteForm.locator('input[name="title"]')).toBeVisible({
        timeout: 2_000,
      });
    }).toPass({ timeout: 20_000 });

    await noteForm.locator('input[name="title"]').fill(noteTitle);
    await noteForm
      .locator('textarea[name="content"]')
      .fill("Created by the note e2e test.");

    const createResponse = page.waitForResponse(
      (r) => r.url().endsWith("/notes/") && r.request().method() === "POST",
    );
    await noteForm.getByRole("button", { name: "Save", exact: true }).click();
    const created = await createResponse;
    expect(created.ok()).toBeTruthy();
    const note = await created.json();
    expect(note.id, "create response should include a note id").toBeTruthy();

    // It renders in notes mode.
    await page.goto(`${viewerUrl}?mode=notes`);
    await expect(page.getByText(noteTitle).first()).toBeVisible({
      timeout: 15_000,
    });

    // --- EDIT -----------------------------------------------------------
    // Reload annotating mode fresh so no pending invalidation resets the form.
    await page.goto(`${viewerUrl}?mode=annotating`);
    let form = await openNoteForEditing(page);
    await form.locator('input[name="title"]').fill(editedNoteTitle);
    const editResponse = page.waitForResponse(
      (r) =>
        r.url().includes(`/notes/${note.id}/`) &&
        r.request().method() === "PATCH",
    );
    await form.getByRole("button", { name: "Save", exact: true }).click();
    expect((await (await editResponse).json()).title).toBe(editedNoteTitle);

    // --- CHANGE ACCESS --------------------------------------------------
    await page.goto(`${viewerUrl}?mode=annotating`);
    form = await openNoteForEditing(page);
    await form.locator('label[for="public"]').click();
    const accessResponse = page.waitForResponse(
      (r) =>
        r.url().includes(`/notes/${note.id}/`) &&
        r.request().method() === "PATCH",
    );
    await form.getByRole("button", { name: "Save", exact: true }).click();
    expect((await (await accessResponse).json()).access).toBe("public");

    // --- DELETE ---------------------------------------------------------
    await page.goto(`${viewerUrl}?mode=annotating`);
    form = await openNoteForEditing(page);
    const deleteResponse = page.waitForResponse(
      (r) =>
        r.url().includes(`/notes/${note.id}/`) &&
        r.request().method() === "DELETE",
    );
    await form.getByRole("button", { name: "Delete", exact: true }).click();
    expect((await deleteResponse).ok()).toBeTruthy();

    // The note list is now empty.
    await expect
      .poll(
        async () => {
          const r = await page.request.get(notesUrl);
          return r.ok() ? (await r.json()).results.length : -1;
        },
        { timeout: 15_000 },
      )
      .toBe(0);
  } finally {
    if (docApiUrl && baseURL) await deleteDocument(page, docApiUrl, baseURL);
  }
});
