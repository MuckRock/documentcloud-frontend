# Plan: Document Lifecycle E2E Test

A Playwright end-to-end test covering the full document lifecycle as a real
logged-in user experiences it: **upload → wait for processing → verify the
document views correctly → delete**. This is the scaffold; we'll insert more
steps (editing metadata, annotations, sharing, etc.) between upload and delete
later.

## Goal

A single authenticated spec that, against a running site, proves a document can
make it all the way through the pipeline and be cleaned up afterward — with no
orphaned test documents left behind, even on failure.

## What already exists (reuse, don't rebuild)

- `playwright.config.ts` — three projects: `setup`, `chromium` (anon),
  `authenticated`. Our spec runs in `authenticated` (any `*.spec.ts` not
  matching `*.anon.spec.ts`).
- `tests/auth.setup.ts` — logs in via Squarelet, saves session to
  `playwright/.auth/user.json`. Skips cleanly when `DC_TEST_USERNAME` /
  `DC_TEST_PASSWORD` are unset, so the new spec is also skipped on machines
  without creds.
- `tests/fixtures/Small pdf.pdf` — small sample PDF; ideal for a fast-processing
  upload.
- `tests/home.spec.ts` — reference for the authenticated test shape.

## The UI flow (grounded in the code)

1. **Upload** — route `/upload/`, component
   `src/lib/components/forms/Upload.svelte`.
   - File picker button: text **"Select Files"** (`FileInput`, renders a real
     `<input type="file">` — use Playwright `setInputFiles`).
   - Submit button: text **"Begin Upload"** (`type="submit"`, disabled until a
     file is added).
   - Per-file rows are `UploadListItem` with status steps:
     `ready → created → uploading → processing → done`, plus an editable
     **title** input (`name="title"`).
   - Access defaults via `AccessLevel` (`name="access"`); leave default
     (private) for the test.
2. **Processing** — after upload the app polls `GET documents/pending/`
   (`documents.pending()` in `src/lib/api/documents.ts`). UI surfaces:
   - `Pending.svelte` banner ("Processing last upload", N remaining).
   - In the viewer, `ViewerActions` shows a spinning **"Processing"** indicator
     while the doc id is in the pending set.
   - Document `status` transitions `pending`/`readable` → `success` (or
     `error`).
3. **View** — viewer route `/documents/{id}-{slug}/`
   (`canonicalUrl()` in `documents.ts`). Title renders as `h1.title`; pages
   render in `<main>`.
4. **Delete** — from the viewer, `ViewerActions` has a **"Delete"** button →
   `ConfirmDelete` modal (title **"Confirm Delete"**, confirm button
   **"Delete"**). Server action `?/delete` redirects to `/documents/`.

## Strategy decisions

### Identifying _our_ document

Generate a unique title per run, e.g.
`E2E lifecycle <ISO-timestamp>-<short-random>`. Every step locates the document
by this title — no reliance on "the newest document", which is fragile when
runs overlap or other test data exists.

### Waiting for processing (the hard part)

Polling the UI alone is brittle. Preferred approach: capture the created
document's **id** and poll the API for terminal status.

- After "Begin Upload", capture the create response. Either:
  - (a) intercept the `POST .../documents/` response via
    `page.waitForResponse` and read the returned `id`/`slug`, or
  - (b) wait for the UploadListItem to reach the **"done"** step, then navigate
    to `/documents/` and open the doc by title.
- Then `expect.poll()` (or a request to `GET documents/{id}/`) until
  `status === "success"`, with a generous timeout (processing a small PDF is
  usually fast but cold workers can be slow — budget ~60–120s, mirroring the
  long timeouts already used in `auth.setup.ts`).
- Treat `status === "error"`/`nofile` as a hard failure with a clear message.

Decision to confirm during implementation: prefer the API-response id capture
(a) for reliability; fall back to UI "done" + title lookup (b) if response
interception is awkward through the OAuth/CSRF setup.

### Guaranteed cleanup

Delete must run even if the view assertions fail, so the dev environment doesn't
accumulate test docs. Use a `try/finally`: do the upload + capture id in the
body, run view assertions, and perform deletion in `finally` keyed off the
captured id. Within the test, prefer deleting **through the UI** (the behavior
we want to cover); but the `finally` safety-net deletion can fall back to an API
`DELETE documents/{id}/` (with CSRF token from the cookie) if the UI delete
didn't happen.

### Single serial flow, not parallel steps

The lifecycle is inherently sequential and shares state (the document id), so
write it as one `test()` (or a `test.describe.serial` if we later split steps
into separate `test()` blocks). Do **not** rely on `fullyParallel` for these.

## File layout

- `tests/document-lifecycle.spec.ts` — the new spec (runs in `authenticated`).
- Optionally `tests/helpers/documents.ts` — small helpers:
  - `uniqueTitle(prefix)`
  - `waitForProcessed(page, id, opts)` — poll API for terminal status
  - `deleteDocument(page, id)` — API cleanup fallback
  - keep helpers minimal; only extract what the spec actually reuses.

## Test outline (`tests/document-lifecycle.spec.ts`)

```
test("upload → process → view → delete", async ({ page }) => {
  test.setTimeout(180_000); // cold processing headroom
  const title = uniqueTitle("E2E lifecycle");
  let docId: number | undefined;

  try {
    // UPLOAD
    await page.goto("/upload/");
    await page.locator('input[type=file]').setInputFiles("tests/fixtures/Small pdf.pdf");
    // set the title field on the file row to `title`
    // capture POST documents/ response -> docId / slug
    // click "Begin Upload"

    // PROCESS
    // expect.poll GET documents/{docId}/ until status === "success"

    // VIEW
    await page.goto(`/documents/${docId}-${slug}/`);
    await expect(page.locator("h1.title")).toContainText(title);
    // assert viewer rendered (pages/main content present)

    // DELETE (through the UI)
    // click "Delete" in ViewerActions -> confirm modal "Delete"
    // expect redirect to /documents/ and doc no longer present
    deletedViaUi = true;
  } finally {
    // safety net: if not deleted via UI and we have an id, API DELETE it
  }
});
```

## Status: ✅ Implemented & passing

Built in `tests/document-lifecycle.spec.ts` (+ helpers in
`tests/helpers/documents.ts`). The full upload → process → view → delete flow
runs green against dev in ~20s and is stable across repeated runs. No test
documents are left behind (the spec asserts a 404 after delete, with an API
cleanup safety net in `finally`).

### Resolved open questions

1. **Test account capability** — ✅ The `DC_TEST_USERNAME` account is verified
   and can upload on dev. Still skips cleanly when creds are absent.
2. **CSRF for API calls** — ✅ Cookie is `csrftoken`, header is `X-CSRFToken`
   (read from `page.context().cookies()` for the cleanup DELETE, with `Referer`
   set to the frontend origin).
3. **Create-response shape** — the create `id` is captured by intercepting the
   `POST .../documents/` response; the final `slug` comes from the status poll
   (`GET documents/{id}/`), which is the reliable source.
4. **Viewer "loaded" assertion** — assert `h1.title` contains our title and the
   first `.page` is visible.

### Key gotchas discovered (important for future steps)

- **Hydration races.** Interactions that depend on a Svelte `onclick` fail
  silently if fired before the page hydrates — the element just focuses and the
  handler never runs. Two spots hit this:
  - Upload page: gate on the **"Select Files" button being enabled** (a
    reactive state that only flips post-hydration), then drive the real file
    chooser rather than `setInputFiles` on the hidden input.
  - Viewer "Delete": retry the open-click with `expect(...).toPass()` until the
    confirmation modal actually appears.
- **`nofile` is transient**, not a failure: right after create the browser is
  still PUTting to S3 / kicking off processing, so the doc briefly reports
  `nofile` before `pending` → `success`. Only `error` is a terminal failure.
- **Disambiguate accessible names with `exact: true`** — the Dropzone wrapper
  exposes a `role="button"` whose name includes child text, so "Select Files" /
  "Begin Upload" match two elements without `exact`.
- The viewer URL is itself `/documents/{id}-{slug}/`, so after a single delete
  wait for the **list** URL (`pathname === "/documents/"`), not just
  `/documents/`.

## Out of scope (for now)

- Editing metadata, annotations/notes, projects, sharing/embed — these are the
  "more steps in between" to add once the skeleton is green.
- Cross-browser (Firefox/WebKit) — chromium only for now.

## Definition of done

- `npm run test:e2e` runs the spec in the `authenticated` project; it passes
  against `https://www.dev.documentcloud.org` with valid test creds.
- No test document remains after the run (verified by title search).
- Skips cleanly (no failure) when creds are absent.
