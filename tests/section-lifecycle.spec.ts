import { test, expect } from "./helpers/fixtures";
import { expectPdfRendered } from "./helpers/documents";

// Section lifecycle: open the "Sections" modal, create/update/delete a section.
// CRUD is direct browser→API, so each step is verified from its call's response.

test("create → update → delete a section", async ({ page, processedDoc }) => {
  test.setTimeout(180_000);

  const { docApiUrl, viewerUrl } = processedDoc;
  const sectionsUrl = `${docApiUrl}sections/`;
  const sectionTitle = "E2E section";
  const editedTitle = `${sectionTitle} (edited)`;

  await page.goto(viewerUrl);
  await expectPdfRendered(page);

  const form = page.locator(".dialog form");
  const newRow = form.locator("tr#section-new");

  // Open the Sections dropdown, then the edit modal. Clicks depend on hydration,
  // so retry until the modal appears. Button is "Add Sections" / "Edit Sections".
  await expect(async () => {
    await page.locator(".sections .anchor").click();
    await page
      .getByRole("button", { name: /^(Add Sections|Edit Sections)$/ })
      .click();
    await expect(form).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });

  // --- CREATE -----------------------------------------------------------
  // Page field is 1-indexed: display "1" -> page_number 0, valid for any doc
  // (a display value past the last page is rejected with a 400).
  await newRow.locator("input[name='page_number']").fill("1");
  await newRow.locator("input[name='title']").fill(sectionTitle);

  const createResponse = page.waitForResponse(
    (r) => r.url().endsWith("/sections/") && r.request().method() === "POST",
  );
  await newRow.getByRole("button", { name: "Add New Section" }).click();
  const created = await createResponse;
  expect(created.ok(), "create should return a 2xx").toBeTruthy();
  const section = await created.json();
  expect(
    section.id,
    "create response should include a section id",
  ).toBeTruthy();
  expect(section.title).toBe(sectionTitle);
  expect(section.page_number, "display 1 -> page_number 0").toBe(0);

  // The saved section renders as an editable row once the invalidate reload
  // lands; waiting on it also ensures no pending reload resets our next edit.
  const savedRow = form.locator(`tr#section-${section.id}`);
  await expect(savedRow.locator("input[name='title']")).toHaveValue(
    sectionTitle,
  );

  // --- UPDATE -----------------------------------------------------------
  await savedRow.locator("input[name='title']").fill(editedTitle);
  const updateResponse = page.waitForResponse(
    (r) =>
      r.url().includes(`/sections/${section.id}/`) &&
      r.request().method() === "PATCH",
  );
  await savedRow.getByRole("button", { name: "Update Section" }).click();
  const updated = await updateResponse;
  expect(updated.ok(), "update should return a 2xx").toBeTruthy();
  expect((await updated.json()).title).toBe(editedTitle);

  // --- DELETE -----------------------------------------------------------
  const deleteResponse = page.waitForResponse(
    (r) =>
      r.url().includes(`/sections/${section.id}/`) &&
      r.request().method() === "DELETE",
  );
  await savedRow.getByRole("button", { name: "Delete" }).click();
  expect(
    (await deleteResponse).ok(),
    "delete should return a 2xx",
  ).toBeTruthy();

  // The section list is now empty.
  await expect
    .poll(
      async () => {
        const r = await page.request.get(sectionsUrl);
        return r.ok() ? (await r.json()).results.length : -1;
      },
      { timeout: 15_000 },
    )
    .toBe(0);
});

// Regression guard: users fill the row and click the prominent "Done" — it must
// save the pending section before closing, not silently discard it.
test("clicking Done saves a filled-in new section", async ({
  page,
  processedDoc,
}) => {
  test.setTimeout(180_000);

  const { docApiUrl, viewerUrl } = processedDoc;
  const sectionsUrl = `${docApiUrl}sections/`;
  const sectionTitle = "E2E section via Done";

  await page.goto(viewerUrl);
  await expectPdfRendered(page);

  const form = page.locator(".dialog form");
  const newRow = form.locator("tr#section-new");

  await expect(async () => {
    await page.locator(".sections .anchor").click();
    await page
      .getByRole("button", { name: /^(Add Sections|Edit Sections)$/ })
      .click();
    await expect(form).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });

  // Fill only the title (default page "1" -> page_number 0 is always valid),
  // then click the primary "Done" button instead of the row's add button.
  await newRow.locator("input[name='title']").fill(sectionTitle);

  const createResponse = page.waitForResponse(
    (r) => r.url().endsWith("/sections/") && r.request().method() === "POST",
  );
  await form.getByRole("button", { name: "Done" }).click();
  const created = await createResponse;
  expect(created.ok(), "Done should create the pending section").toBeTruthy();

  // The modal closes and the section persists.
  await expect(form).toBeHidden();
  await expect
    .poll(
      async () => {
        const r = await page.request.get(sectionsUrl);
        return r.ok() ? (await r.json()).results.length : -1;
      },
      { timeout: 15_000 },
    )
    .toBe(1);
});

// When the API rejects a section (e.g. a page past the end of the document),
// the form must surface the error instead of silently discarding it.
test("shows the API error when a section can't be created", async ({
  page,
  processedDoc,
}) => {
  test.setTimeout(180_000);

  const { viewerUrl } = processedDoc;

  await page.goto(viewerUrl);
  await expectPdfRendered(page);

  const form = page.locator(".dialog form");
  const newRow = form.locator("tr#section-new");

  await expect(async () => {
    await page.locator(".sections .anchor").click();
    await page
      .getByRole("button", { name: /^(Add Sections|Edit Sections)$/ })
      .click();
    await expect(form).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });

  // The fixture is a single page, so display "2" (page_number 1) is out of
  // range and the backend rejects it with a validation error.
  await newRow.locator("input[name='page_number']").fill("2");
  await newRow.locator("input[name='title']").fill("Out of range");

  const createResponse = page.waitForResponse(
    (r) => r.url().endsWith("/sections/") && r.request().method() === "POST",
  );
  await newRow.getByRole("button", { name: "Add New Section" }).click();
  expect((await createResponse).status(), "expected a 400").toBe(400);

  // The validation detail is shown and the modal stays open.
  await expect(form.getByRole("alert")).toBeVisible();
  await expect(form).toContainText(/valid page for the document/i);
  await expect(form).toBeVisible();
});
