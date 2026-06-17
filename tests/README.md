# End-to-end tests

[Playwright](https://playwright.dev) tests that run in a headless browser
against a running version of the site. These are separate from the Vitest unit
tests under `src/`.

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

By default tests run against `https://www.dev.documentcloud.org`. Override the
target with the `URL` environment variable. In CI this is set automatically to
the PR's Cloudflare preview deploy
(`https://preview-<PR_NUMBER>.staging.documentcloud.org`):

```sh
URL=https://preview-123.staging.documentcloud.org npm run test:e2e
```

## Projects

The config (`playwright.config.ts`) defines three projects:

- **`setup`** — runs `auth.setup.ts`, which logs in through Squarelet and saves
  the authenticated session to `playwright/.auth/user.json`.
- **`chromium`** — logged-out tests. Name these files `*.anon.spec.ts`.
- **`authenticated`** — logged-in tests. Any other `*.spec.ts` runs here and
  reuses the saved session (depends on `setup`).

## Authentication

Authenticated tests need a dedicated test account on the dev/staging
environment. Set credentials in `.env` (never use a production login):

```sh
DC_TEST_USERNAME=...
DC_TEST_PASSWORD=...
```

If these are unset, the auth setup is skipped and authenticated tests don't run.
The Squarelet login selectors in `auth.setup.ts` may need adjusting if
Squarelet's markup changes.

## Fixtures

`fixtures/` holds sample PDFs for use in tests (e.g. file-upload flows). Prefer
a small file (`Small pdf.pdf`) so processing finishes quickly.

## Helpers

`helpers/` holds shared utilities used across specs. Currently
`helpers/documents.ts`:

- `uniqueTitle(prefix)` — a per-run unique title so a spec can find _its_
  document by name (never "the newest document", which races other runs).
- `waitForProcessed(request, docApiUrl)` — polls the document API until it
  reaches `success`. Pass `page.request` so the poll shares the authenticated
  session.
- `deleteDocument(page, docApiUrl, referer)` — deletes a document straight
  through the API (CSRF from the cookie). Used as a cleanup safety net.

## The document-lifecycle spec

`document-lifecycle.spec.ts` is the end-to-end backbone: a logged-in user
uploads a document, waits for it to process, verifies it views correctly, then
deletes it. It's written as one serial flow because every step shares the new
document's id. New per-document journeys (editing metadata, notes, sharing, …)
should slot in between "view" and "delete".

## Writing e2e tests here — lessons learned

These bit us while building the lifecycle spec. Read before adding interactions.

### Hydration races: the first click after navigation can silently no-op

Interactions that depend on a Svelte `onclick` do **nothing** if they fire
before the page has hydrated — the element just receives focus (it shows up as
`[active]` in the failure snapshot) and the handler never runs. The test then
hangs waiting for a result that never comes. Native form **submit** buttons are
unaffected (the browser submits regardless).

Don't trust the first click after `goto`. Gate on a signal that only flips
post-hydration, or retry the action:

- Gate on reactive state. The upload page's "Select Files" button is `disabled`
  until the component mounts and reads the CSRF token, so
  `await expect(selectFiles).toBeEnabled()` is a reliable "ready" signal. Then
  drive the **real file chooser** rather than `setInputFiles` on the hidden
  `<input>`:

  ```ts
  const fileChooser = page.waitForEvent("filechooser");
  await selectFiles.click();
  await (await fileChooser).setFiles("tests/fixtures/Small pdf.pdf");
  ```

- Retry until the effect appears. For the viewer's "Delete" (which opens a
  modal), retry the open-click until the modal is visible:

  ```ts
  await expect(async () => {
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirmForm).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  ```

### Disambiguate accessible names with `exact: true`

The Dropzone wrapper exposes a `role="button"` whose accessible name includes
its child text, so `getByRole("button", { name: "Select Files" })` and
`"Begin Upload"` each match **two** elements (strict-mode violation). Use
`{ name: "…", exact: true }`. When a modal's confirm button shares text with the
button that opened it (both "Delete"), scope the confirm to its form:
`page.locator('form[action*="?/delete"]').getByRole("button", { name: "Delete", exact: true })`.

### Document status: `nofile` is transient, not a failure

Upload is fully client-side (create → S3 PUT → `process`). Right after create
the document briefly reports `status: "nofile"` before moving to `pending` →
`success`. When polling, treat only `error` (and timeout) as a real failure;
keep waiting through `nofile`/`pending`/`readable`.

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

The final `slug` is most reliably read from the status poll. The viewer URL is
`/documents/{id}-{slug}/` — note it shares the `/documents/` prefix with the
list, so after a single delete (which navigates to the user's list) wait for
`url.pathname === "/documents/"`, not a loose `/documents/` match.

### Direct API calls (status polls, cleanup)

`page.request` shares the browser context's cookies, so it's authenticated for
reading private documents. For mutating calls (e.g. cleanup DELETE) set the CSRF
header and a `Referer`:

```ts
const csrf =
  (await page.context().cookies()).find((c) => c.name === "csrftoken")?.value ??
  "";
await page.request.delete(docApiUrl, {
  headers: { "X-CSRFToken": csrf, Referer: baseURL },
});
```

### Always clean up test data

Anything a spec creates should be removed even when assertions fail. Capture the
id early, do the work in `try`, and delete in `finally` (through the API if the
UI delete didn't run). The lifecycle spec also asserts the document 404s after
deletion to prove cleanup worked.

## Debugging tips

- A failed run drops a screenshot, video, and (on retry/CI) a trace under
  `test-results/`. Open a trace with `npx playwright show-trace <path>`.
- `error-context.md` next to those artifacts contains an aria snapshot of the
  page at the moment of failure — great for seeing whether a modal actually
  opened or which elements matched a role/name.
- `npm run test:e2e:ui` (Playwright UI mode) is the fastest way to step through
  a flow and inspect selectors live.
