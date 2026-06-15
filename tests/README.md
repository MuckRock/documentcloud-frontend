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

`fixtures/` holds sample documents (PDFs) and environment JSON used by tests.
`fixtures/development.json` is gitignored — generate your own locally.
