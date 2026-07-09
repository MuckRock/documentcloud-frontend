# End-to-end tests

[Playwright](https://playwright.dev) tests that run in a headless browser against a running version of the site. These are separate from the Vitest unit tests under `src/`.

## Setup

Browsers are installed on demand:

```sh
npx playwright install chromium
```

## Running

```sh
npm run test:e2e          # run all e2e tests
npm run test:e2e:ui       # interactive UI mode (great for debugging)
npm run test:e2e:headed   # watch the browser as tests run
npm run test:e2e:report   # open the last HTML report
```

By default tests run against `https://www.dev.documentcloud.org`. Override the target with the `URL` environment variable. In CI this is set automatically to the PR's Cloudflare preview deploy (`https://preview-<PR_NUMBER>.staging.documentcloud.org`):

```sh
URL=https://preview-123.staging.documentcloud.org npm run test:e2e
```

## Projects

The config (`playwright.config.ts`) defines three projects:

- **`setup`** — runs `auth.setup.ts`, which logs in through Squarelet and saves the authenticated session to `playwright/.auth/user.json`.
- **`chromium`** — logged-out tests. Name these files `*.anon.spec.ts`.
- **`authenticated`** — logged-in tests. Any other `*.spec.ts` runs here and reuses the saved session (depends on `setup`).

The suite runs with a **single worker** (`workers: 1`). The authenticated specs upload and (re)process documents against a shared dev/staging backend whose processing queue can't keep up with concurrent jobs — in parallel, processing slows enough to blow the per-test timeouts. The suite is small, so serial execution costs little and keeps it reliable.

## Authentication

Authenticated tests need a dedicated test account on the dev/staging environment. Set credentials in `.env` (never use a production login):

```sh
DC_TEST_USERNAME=...
DC_TEST_PASSWORD=...
```

If these are unset, the auth setup is skipped and authenticated tests don't run. The Squarelet login selectors in `auth.setup.ts` may need adjusting if Squarelet's markup changes.

## Fixtures

`fixtures/` holds sample PDFs for use in tests (e.g. file-upload flows). Prefer a small file (`Small pdf.pdf`) so processing finishes quickly.

## Helpers

`helpers/` holds shared utilities used across specs.

`helpers/documents.ts`:

- `uniqueTitle(prefix)` — a per-run unique title so a spec can find _its_ document by name (never "the newest document", which races other runs). Also used by the project spec.
- `uploadDocument(page, { title, fixture })` — uploads through the UI and returns `{ id, docApiUrl }` once the document is created. Shared by every spec that needs a throwaway document.
- `waitForProcessed(request, docApiUrl)` — polls the document API until it reaches `success`. Pass `page.request` so the poll shares the authenticated session.
- `fetchDoc(page, docApiUrl)` — fetches the document detail JSON. Pair with `expect.poll` to assert a field changed (the detail endpoint reflects edits before the viewer header does).
- `drawBox(page, layer)` — drags a rectangle across a drawing layer (note annotation or redaction), using fractional offsets so it stays in bounds.
- `openModalForm(trigger, form)` — clicks a trigger and retries until the modal's form appears (works around the hydration race; see below).
- `deleteDocument(page, docApiUrl, referer)` — deletes a document straight through the API (CSRF from the cookie). Used as a cleanup safety net.

`helpers/projects.ts`:

- `createProject(page, { title, description })` — creates a project through the UI and returns `{ id, detailPath }`. Because create is a server-side form action (not client-side like upload), the browser never sees an API URL, so it finds the new project by filtering the list on its unique title.
- `deleteProject(page, projectApiUrl, referer)` — deletes a project straight through the API (mirrors `deleteDocument`). Cleanup safety net.
- `apiBaseUrl(baseURL)` — resolves the API origin for the environment (prefers `DC_API_URL`, else swaps `www.`→`api.`), mirroring `auth.setup.ts`. Projects have no browser-facing API URL, so this is how the spec reaches the API to confirm a delete.

## The specs

- **`document-lifecycle.spec.ts`** — the end-to-end backbone: upload → process → confirm the PDF renders → make public → edit metadata → check text and grid modes render → delete. One serial flow because every step shares the new document's id.
- **`document-management.spec.ts`** — self-contained operations that re-trigger processing: redact a document, and reprocess one. Each uploads its own throwaway doc and deletes it in `finally`.
- **`note-lifecycle.spec.ts`** — the note lifecycle on the viewer: create a note by drawing on the page (annotating mode), edit it, change its access, delete it. Note CRUD is direct browser→API, so each step is verified via that call's response.
- **`project-lifecycle.spec.ts`** — the project lifecycle: create a project → view it → edit its metadata → open the share modal → delete it. Exercises the project forms (`EditProject` create + edit, `ProjectShare`, `DeleteProject`). Deletion is confirmed against the API (the delete redirect is the UI signal; the frontend is served SPA-style, so its HTTP status is never 404). Collaborator invite/update/remove are intentionally excluded — inviting sends a real email and update/remove need a second existing collaborator.

### Known dev-backend limitation: image-rendering reprocess paths

Redaction and force-OCR reprocessing both rasterize page images, which on the dev backend fails (`libpng16.so.16` missing in the processing worker), leaving the document `status: error`. This is infra, not a frontend bug. The specs are scoped around it: the redaction test asserts the redaction submits and the doc re-enters processing (not that it finishes), and the reprocess test uses a **plain** reprocess (no force OCR), which completes. See `notes/backend-redaction-libpng-error.md` for the debugging runbook.

## Writing e2e tests here — lessons learned

These bit us while building the lifecycle spec. Read before adding interactions.

### Hydration races: the first click after navigation can silently no-op

Interactions that depend on a Svelte `onclick` do **nothing** if they fire before the page has hydrated — the element just receives focus (it shows up as `[active]` in the failure snapshot) and the handler never runs. The test then hangs waiting for a result that never comes. Native form **submit** buttons are unaffected (the browser submits regardless).

Don't trust the first click after `goto`. Gate on a signal that only flips post-hydration, or retry the action:

- Gate on reactive state. The upload page's "Select Files" button is `disabled` until the component mounts and reads the CSRF token, so `await expect(selectFiles).toBeEnabled()` is a reliable "ready" signal. Then drive the **real file chooser** rather than `setInputFiles` on the hidden `<input>`:

  ```ts
  const fileChooser = page.waitForEvent("filechooser");
  await selectFiles.click();
  await (await fileChooser).setFiles("tests/fixtures/Small pdf.pdf");
  ```

- Retry until the effect appears. For the viewer's "Delete" (which opens a modal), retry the open-click until the modal is visible:

  ```ts
  await expect(async () => {
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirmForm).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  ```

### Disambiguate accessible names with `exact: true`

The Dropzone wrapper exposes a `role="button"` whose accessible name includes its child text, so `getByRole("button", { name: "Select Files" })` and `"Begin Upload"` each match **two** elements (strict-mode violation). Use `{ name: "…", exact: true }`. When a modal's confirm button shares text with the button that opened it (both "Delete"), scope the confirm to its form: `page.locator('form[action*="?/delete"]').getByRole("button", { name: "Delete", exact: true })`.

### Document status: `nofile` is transient, not a failure

Upload is fully client-side (create → S3 PUT → `process`). Right after create the document briefly reports `status: "nofile"` before moving to `pending` → `success`. When polling, treat only `error` (and timeout) as a real failure; keep waiting through `nofile`/`pending`/`readable`.

### Viewer modes: switch via the `mode` query param

The viewer's mode switcher renders as tabs at wide widths but collapses to a dropdown when the toolbar is narrow, so clicking it is layout-dependent. Navigate directly instead: `?mode=text`, `?mode=grid`, etc. Asserting on the rendered content also doubles as a processing check — text mode (`.textPages pre`) only has content if text was extracted, and grid mode (`.pages img[alt*="Page"]`) only shows thumbnails once page images were generated. The default ("document") mode draws to `<canvas>`; assert `.page-container[data-loaded="true"]` to confirm pdf.js actually rendered.

### Verify backend mutations via the API, not the UI badge

After an edit (e.g. changing access to public), the viewer header can lag behind backend indexing — the code even forces the value locally because it's "often a step behind". Use the modal closing as the UI-level success signal, then confirm the change by polling the document detail endpoint (`fetchDoc` + `expect.poll`), which reflects it immediately. For direct browser→API actions (notes), intercept the request's response and assert on its JSON — that's immediate and authoritative.

### Reload before editing: a background invalidate can reset the form

Editable forms (metadata, notes) bind their inputs to the document store. After any save the app calls `invalidate(...)`, and when that reload lands it re-renders the form and **resets your typed-but-unsaved input**. If you edit right after another mutation, the in-flight reload can clobber the field between `fill` and submit — intermittently submitting the old value. Start the edit from a freshly-loaded page (`await page.goto(viewerUrl)`) so no reload is pending.

### Capturing the new document id, and the viewer URL

Capture the id by intercepting the create call:

```ts
const created = await page.waitForResponse(
  (r) =>
    r.request().method() === "POST" &&
    /\/documents\/$/.test(new URL(r.url()).pathname),
);
const { id } = await created.json();
```

The final `slug` is most reliably read from the status poll. The viewer URL is `/documents/{id}-{slug}/` — note it shares the `/documents/` prefix with the list, so after a single delete (which navigates to the user's list) wait for `url.pathname === "/documents/"`, not a loose `/documents/` match.

### Direct API calls (status polls, cleanup)

`page.request` shares the browser context's cookies, so it's authenticated for reading private documents. For mutating calls (e.g. cleanup DELETE) set the CSRF header and a `Referer`:

```ts
const csrf =
  (await page.context().cookies()).find((c) => c.name === "csrftoken")?.value ??
  "";
await page.request.delete(docApiUrl, {
  headers: { "X-CSRFToken": csrf, Referer: baseURL },
});
```

### Always clean up test data

Anything a spec creates should be removed even when assertions fail. Capture the id early, do the work in `try`, and delete in `finally` (through the API if the UI delete didn't run). The lifecycle spec also asserts the document 404s after deletion to prove cleanup worked.

## Debugging tips

- A failed run drops a screenshot, video, and (on retry/CI) a trace under `test-results/`. Open a trace with `npx playwright show-trace <path>`.
- `error-context.md` next to those artifacts contains an aria snapshot of the page at the moment of failure — great for seeing whether a modal actually opened or which elements matched a role/name.
- `npm run test:e2e:ui` (Playwright UI mode) is the fastest way to step through a flow and inspect selectors live.
