import type { Page } from "@playwright/test";

import { expect } from "@playwright/test";

import { openModalForm } from "./documents";

/**
 * Resolve the API origin for the environment under test. Mirrors the same logic
 * in `auth.setup.ts`: prefer an explicit `DC_API_URL` (set in CI, where the
 * preview frontend and the staging API live on unrelated hosts), otherwise swap
 * the `www.` subdomain of the app URL for `api.`. Trailing slash stripped so
 * callers can append `/api/...` cleanly.
 *
 * Projects are created and deleted through server-side form actions, so — unlike
 * documents, whose client-side upload hands back an API URL — the browser never
 * sees a project's API URL. This is how the spec reaches the API to confirm a
 * delete really removed the project.
 */
export function apiBaseUrl(baseURL: string): string {
  const apiURL = process.env.DC_API_URL || baseURL.replace("//www.", "//api.");
  return apiURL.replace(/\/$/, "");
}

export interface CreatedProject {
  /** Numeric project id (as a string, read off the list item's anchor). */
  id: string;
  /** Host-independent detail path, `/projects/{id}-{slug}/`. */
  detailPath: string;
}

/**
 * Create a project through the UI and return its id and detail path.
 *
 * Create is a server-side form action (unlike document upload, which is
 * client-side), so the browser never sees an API response to read the id from.
 * Instead we find the new project on the list afterwards: the owned list is
 * paginated and not newest-first, so we filter by the (unique) title. The
 * `query` filter is index-backed and can lag a beat behind the create, so retry
 * the navigation until our project shows up.
 */
export async function createProject(
  page: Page,
  { title, description }: { title: string; description?: string },
): Promise<CreatedProject> {
  await page.goto("/projects/");

  // Create mode posts to `/projects/` (edit mode posts to `?/edit`), so the
  // action attribute disambiguates this form.
  const createForm = page.locator('form[action$="/projects/"]');
  await openModalForm(
    page.getByRole("button", { name: "Create Project", exact: true }),
    createForm,
  );

  await createForm.locator('input[name="title"]').fill(title);
  if (description) {
    await createForm.locator('textarea[name="description"]').fill(description);
  }
  // The submit button also reads "Create Project"; scope it to the form.
  await createForm
    .getByRole("button", { name: "Create Project", exact: true })
    .click();
  await expect(createForm).toBeHidden({ timeout: 15_000 });

  // Find our project by title. Retry the search navigation to ride out any
  // indexing lag between the create and the project becoming searchable.
  const link = page.getByRole("link", { name: title, exact: true });
  await expect(async () => {
    await page.goto(`/projects/?query=${encodeURIComponent(title)}`);
    await expect(link).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 30_000 });

  // The list item's anchor carries the project id and its canonical href. Use
  // the href's pathname (not the full URL): `canonicalUrl` builds it against the
  // configured APP_URL host, which differs from the test target on preview
  // deploys — the path is the same everywhere.
  const id = await link.getAttribute("id");
  const href = await link.getAttribute("href");
  if (!id || !href) {
    throw new Error("created project link is missing its id/href");
  }

  return { id, detailPath: new URL(href).pathname };
}

/**
 * Cleanup safety net: delete a project straight through the API, mirroring
 * `deleteDocument` — CSRF token from the cookie, Referer set to the frontend
 * origin. Used in `finally` so a failed UI flow never orphans a test project.
 */
export async function deleteProject(
  page: Page,
  projectApiUrl: string,
  referer: string,
): Promise<void> {
  const cookies = await page.context().cookies();
  const csrf = cookies.find((c) => c.name === "csrftoken")?.value ?? "";

  await page.request.delete(projectApiUrl, {
    headers: {
      "X-CSRFToken": csrf,
      Referer: referer,
    },
  });
}
