import { test, expect } from "@playwright/test";

import { openModalForm, uniqueTitle } from "./helpers/documents";
import { apiBaseUrl, createProject, deleteProject } from "./helpers/projects";

// The project lifecycle as a logged-in user: create a project, view it, edit
// its metadata, open the share modal, then delete it. Exercises the migrated
// project forms — EditProject (create + edit), ProjectShare, and DeleteProject —
// which the other e2e specs don't touch.
//
// Collaborator invite/update/remove are deliberately out of scope: inviting
// sends a real invitation to an email address, and update/remove need a second
// existing collaborator. Both make this spec depend on external state / side
// effects against the shared backend. Add them only with a dedicated test
// collaborator account.
test("create → view → edit → share → delete a project", async ({
  page,
  baseURL,
}) => {
  const title = uniqueTitle("E2E project");
  let detailPath: string | undefined;
  let projectApiUrl: string | undefined;
  let deletedViaUi = false;

  try {
    // --- CREATE ---------------------------------------------------------
    const created = await createProject(page, {
      title,
      description: "Created by the project lifecycle e2e test.",
    });
    detailPath = created.detailPath;
    projectApiUrl = `${apiBaseUrl(baseURL!)}/api/projects/${created.id}/`;

    // --- VIEW -----------------------------------------------------------
    await page.goto(detailPath);
    await expect(page.locator("article header h1")).toHaveText(title);

    // --- EDIT METADATA --------------------------------------------------
    const editedTitle = `${title} (edited)`;
    const editForm = page.locator('form[action*="?/edit"]');
    await openModalForm(
      page.getByRole("button", { name: "Edit Project Metadata", exact: true }),
      editForm,
    );
    await editForm.locator('input[name="title"]').fill(editedTitle);
    await editForm
      .locator('textarea[name="description"]')
      .fill("Edited by the project lifecycle e2e test.");
    await editForm.getByRole("button", { name: "Save", exact: true }).click();
    await expect(editForm).toBeHidden({ timeout: 15_000 });

    // The saved form reloads the page from `projects.get` (a direct fetch by
    // id, not the search index), so the header reflects the new title straight
    // away — no need to poll the API here.
    await expect(page.locator("article header h1")).toHaveText(editedTitle, {
      timeout: 15_000,
    });

    // --- SHARE (render check) -------------------------------------------
    // Sharing has no server action; just confirm the share modal (ProjectShare)
    // opens and renders its embed preview, then dismiss it. Retry the open —
    // the trigger's onclick can no-op before the view hydrates.
    const embedPreview = page.getByTitle("Embed Preview");
    await expect(async () => {
      await page
        .getByRole("button", { name: "Share & Embed Project", exact: true })
        .click();
      await expect(embedPreview).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 20_000 });

    // Close the modal (Escape) so its backdrop stops intercepting clicks.
    await page.keyboard.press("Escape");
    await expect(embedPreview).toBeHidden({ timeout: 5_000 });

    // --- DELETE (through the UI) ----------------------------------------
    const deleteForm = page.locator('form[action*="?/delete"]');
    await openModalForm(
      page.getByRole("button", { name: "Delete Project", exact: true }),
      deleteForm,
    );
    // The modal's confirm also reads "Delete"; scope it to the delete form.
    await deleteForm
      .getByRole("button", { name: "Delete", exact: true })
      .click();

    // The `?/delete` action redirects to `/projects/` only on success — on any
    // error it returns `fail()` and stays on the detail page — so landing on
    // the list is the UI success signal.
    await page.waitForURL((url) => url.pathname === "/projects/", {
      timeout: 30_000,
    });
    deletedViaUi = true;

    // Confirm the project is actually gone by polling the API directly (the
    // session cookie is scoped to the parent domain, so this request is
    // authenticated). page.request shares the browser context's cookies.
    await expect
      .poll(async () => (await page.request.get(projectApiUrl!)).status(), {
        timeout: 15_000,
      })
      .toBe(404);
  } finally {
    // Safety net: never leave a test project behind.
    if (!deletedViaUi && projectApiUrl && baseURL) {
      await deleteProject(page, projectApiUrl, baseURL);
    }
  }
});
