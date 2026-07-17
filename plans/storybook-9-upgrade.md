# Scope: Storybook 8.6 → 9 → **10** Upgrade

> **⚠️ Key correction (2026-07-17):** the premise that **SB9 mocks `$app/state`**
> is **false**. `@storybook/sveltekit@9.1.20` mocks only `$app/{forms,navigation,
> stores}` — there is no `$app/state` mock and its vite-plugin doesn't alias it
> (verified in the installed package + a headless test: `page.url` came back as
> the unmocked `a:`). The `$app/state` mock (PR #24795) actually shipped in
> **Storybook 10** (`@storybook/sveltekit@10.5.x` ships
> `static/app-state-mock.svelte.js` + `MockProvider.svelte`). We therefore
> upgraded to **SB10**, where the mock works. Everything else in this plan (addon
> consolidation, codemods, addon-cookie removal) applies the same to 9 and 10.

## Progress

- **✅ Page store → page state migration (DONE).** The whole app now reads `page`
  from `$app/state`, not `$app/stores` — verified: **0** `$app/stores` imports
  remain, **40** files import `$app/state`. This widens the blast radius of the
  motivating problem below: it's no longer just the viewer that can't inject a
  URL in Storybook — every `$app/state`-dependent story is affected until SB9
  lands the `$app/state` mock. Raises the priority of steps 1–5.
- **✅ Step 6 — legacy-story modernization (DONE, 2026-07-17).** All 42 unique
  files across Lists A (24) + B (35, 17 overlapping) migrated to the modern Svelte
  CSF API and `<script module>` syntax. `svelte-check` clean (0 errors; the 5
  remaining warnings pre-exist in `src/routes/(app)/+layout.svelte`);
  `build-storybook` succeeds. See "Step 6 notes" below for details.
- **✅ Steps 1–5 — core upgrade + addon cleanup + `$app/state` verify + full
  regression (DONE, 2026-07-17).** Upgraded to **Storybook 10.5.0** (not 9 — see
  Key correction above). Details:
  - **Automigration:** ran `storybook@9 upgrade` then `storybook@10 upgrade`.
    Codemods removed `addon-essentials`/`addon-interactions`, migrated `action`
    imports → `storybook/actions` and `INITIAL_VIEWPORTS` → `storybook/viewport`,
    moved renderer types `@storybook/svelte` → `@storybook/sveltekit`, added
    `@storybook/addon-docs`, and dropped `docs.autodocs: "tag"`.
  - **Versions:** `storybook`/`@storybook/sveltekit`/`@storybook/svelte`/
    `addon-docs`/`addon-links` = 10.5.0; `@storybook/addon-svelte-csf` = ^5.1.2
    (peer resolves cleanly on SB10); `msw-storybook-addon` = ^2.0.7. Removed the
    dead `@storybook/test` + `@storybook/addon-actions`. Removed the auto-added
    `@storybook/addon-mcp` (out of scope).
  - **`storybook-addon-cookie` (the HIGH-risk one): removed** — incompatible with
    SB9+ (imports SB8-era `@storybook/{theming,components,manager-api,...}` that
    were consolidated into `storybook`). Replaced with a one-liner in
    `preview.ts`: `document.cookie = "csrftoken=mockToken; path=/"` (the app's
    `getCsrfToken()` reads `csrftoken` from `document.cookie`).
  - **`$app/state` verified:** PDFPage "search results" story's `page.url` now
    reflects the injected `?q=los angeles` santa-anas URL (headless check).
    Removed the "inert until upgrade" comments in `preview.ts` + the story.
  - **Regression:** `build-storybook` ✅; `svelte-check` ✅ 0 errors; unit tests
    ✅ 990 passed; drove all **545** stories headless — all render. Non-failures
    filtered: pdfjs `UnknownErrorException` (minified `qf`, no PDF backend),
    intentional error-state stories (`File Error`, `With 403 Error`), and
    pre-existing unhandled rejections from API endpoints not covered by a story's
    MSW handlers (stories still render; framework-agnostic, not upgrade-caused).

## Why

`@storybook/sveltekit` **8.6 does not mock `$app/state`** (only `$app/stores`);
its dist has zero references to `$app/state`, so `sveltekit_experimental.state`
is silently ignored. Now that the **entire app** reads `page` from `$app/state`
(the page store → page state migration is complete — 0 `$app/stores` imports, 40
files on `$app/state`), URL-dependent stories can't inject a URL (e.g. the
PDFPage "search results" highlight demo is inert). **Storybook 9 fixes this** — its
SvelteKit framework mocks `$app/state` via `sveltekit_experimental.state`
(resolved in [storybookjs/storybook#30209](https://github.com/storybookjs/storybook/issues/30209),
PR [#24795](https://github.com/storybookjs/storybook/pull/24795)). The
`state.page.url` config already added to `.storybook/preview.ts` starts working
after the upgrade, no further change needed.

Secondary wins: SB9 is faster (lighter install, on-demand deps), and unblocks
the Vitest-based test addon.

## Current state (as of this scope)

- Installed: Storybook **8.6.18** (package.json pins `^8.6.14`).
- Environment already meets SB9 requirements: Node 22 (≥20 ✓), Vite 6 (≥5 ✓),
  Svelte 5 ✓, `@sveltejs/kit` 2.55 ✓.
- **148 stories, all Svelte CSF** (`.stories.svelte`). Two _orthogonal_ legacy
  axes remain (see lists at the bottom); a file can be behind on one, both, or
  neither:
  - **CSF API:** 24 still use the old `import { Story, Template }` component API
    instead of `defineMeta` (124 use `defineMeta`).
  - **Module-script syntax:** 35 still use Svelte 4 `<script context="module">`
    instead of `<script module>`.
  - The repo's `migrate-storybook-csf` skill handles the API conversion.
- `main.ts` addons: `addon-links`, `addon-essentials`, `addon-interactions`,
  `storybook-addon-cookie`, `addon-svelte-csf` (with `legacyTemplate: true`).
- `@storybook/addon-actions` and `@storybook/test` are in package.json but
  **not** registered as addons; `@storybook/test` has **0 imports** in `src`.

## Compatibility matrix (verified against npm registry)

| Package                         | Now    | SB9 action                                                     | Risk |
| ------------------------------- | ------ | -------------------------------------------------------------- | ---- |
| `storybook` (core)              | 8.6.18 | bump `^9`                                                      | low  |
| `@storybook/svelte`             | 8.6    | bump `^9`                                                      | low  |
| `@storybook/sveltekit`          | 8.6    | bump `^9` — **this is what gains `$app/state` mocking**        | low  |
| `@storybook/addon-svelte-csf`   | 5.0.10 | bump `^5.1` — peers already allow `^8.2 \|\| ^9 \|\| ^10`      | low  |
| `@storybook/addon-links`        | 8.6    | bump to version-matched `^9` (published in lockstep with core) | low  |
| `@storybook/addon-essentials`   | 8.6    | **remove** — folded into core (controls/actions/viewport/etc.) | low  |
| `@storybook/addon-interactions` | 8.6    | **remove** — folded into core                                  | low  |
| `@storybook/addon-actions`      | 8.6    | **remove** — `action` now imported from `storybook/actions`    | low  |
| `@storybook/test`               | 8.6    | **remove** — 0 usages (was `storybook/test` in SB9 anyway)     | none |
| `msw-storybook-addon`           | 2.0.6  | bump `2.0.7`; verify loader under SB9 (issue mswjs/#170)       | med  |
| `storybook-addon-cookie`        | 4.0.1  | **highest risk** — last release Oct 2024, no SB9 peer/testing  | HIGH |
| `chromatic`                     | 13.3.4 | no change — CLI; useful as visual-regression safety net        | —    |

## Work breakdown

### 1. Run the automigration (does most of the mechanical work)

```
npx storybook@latest upgrade   # pin to 9.x, not 10, unless we intend 10
npx storybook doctor           # flags incompatible addons
```

This bumps versions, removes `addon-essentials`/`addon-interactions` from
`main.ts`, and runs codemods. **Watch out:** the essentials→core automigration
is known to _delete_ essentials `options` rather than migrate them
([#31610](https://github.com/storybookjs/storybook/issues/31610)) — we pass no
options to essentials, so this is a non-issue for us, but review the `main.ts`
diff regardless.

### 2. Manual code changes

- **8 stories import `action` from `@storybook/addon-actions`** → change to
  `import { action } from "storybook/actions"`. Files:
  `forms/Search`, `common/Toast`, `common/NavItem`, `common/Pin`, `common/Tab`,
  `common/Paginator`, `inputs/Dropzone`, `inputs/File` (`.stories.svelte`).
- Remove the dead `@storybook/test` and `@storybook/addon-actions` devDeps.
- Confirm `addon-svelte-csf`'s `legacyTemplate: true` is still honored (it is in
  5.1.x) — needed until the 35 legacy stories are migrated.

### 3. De-risk the two third-party addons

- **`storybook-addon-cookie`** — only used for `parameters.cookie` /
  `cookiePreserve` in `preview.ts` (sets `csrftoken` for MSW-backed stories).
  If it fails to load under SB9, replacements are cheap: a global decorator or
  `beforeEach` that sets `document.cookie = "csrftoken=mockToken"`. Budget time
  to test and possibly drop it.
- **`msw-storybook-addon`** — used by 15 stories + the global `mswLoader`. 2.0.7
  is loader-based and generally version-tolerant; verify `initialize()` +
  `mswLoader` still work and MSW handlers resolve.

### 4. Verify `$app/state` mocking (the actual goal)

- Remove the "inert until upgrade" comments in `.storybook/preview.ts` and
  `viewer/stories/PDFPage.stories.svelte` once confirmed working.
- Confirm the PDFPage "search results" story reflects `?q=` from
  `state.page.url` (Playwright: assert the highlight / the debug `URL:` line
  shows the santa-anas query URL).

### 5. Full regression pass over 148 stories

- `npm run build-storybook` must succeed.
- Drive every story's iframe headless (extend the Playwright script from the
  `$app/state` verification) to catch runtime/render errors. Expect the
  pre-existing pdfjs `UnknownErrorException` on PDF-loading stories (no backend)
  — filter those.
- If Chromatic is wired to CI, use it as the visual-diff safety net.

### 6. ✅ DONE — modernize the legacy stories

Neither axis blocks SB9 (`legacyTemplate: true` keeps the old API working, and
Svelte 5 still accepts `context="module"` with a deprecation warning), but both
are on borrowed time — SB10 will likely drop `legacyTemplate`. Completed
2026-07-17 (both lists in one pass, since 17 files overlapped).

- **A. Old `Story`/`Template` API → `defineMeta` (24 files).** ✅ Done via the
  `migrate-storybook-csf` skill.
- **B. `<script context="module">` → `<script module>` (35 files).** ✅ Done —
  the 24 List A rewrites got this for free; the other 18 were a mechanical
  rename.

#### Step 6 notes

Migration patterns applied:

- **Plain `<Template let:args>` wrappers** (just `<Comp {...args}/>`) → dropped;
  stories now default to the meta `component`.
- **Composition stories** (explicit markup inside `<Story>`) → `asChild`.
- **Custom-markup templates** → `render` default snippet (DocumentListItem's
  wrapper div; ProjectShare + Toaster) or an inline `{#snippet template}`
  (CustomizeEmbed).
- Dropped the non-standard `id` prop on Price/UpgradePrompt stories.

Type issues surfaced by `defineMeta({ component })` now type-checking `args`
(the old `<Template>` API left args untyped) — all resolved:

- **CustomizeEmbed** — the `document` arg targeted a prop that doesn't exist
  (component only takes `storageManager`); it was inert, so removed.
- **DocumentListItem / Thumbnail** — cast JSON fixtures `as Document` (existing
  repo idiom). Cleaned two latent bugs: a `fullTitle` key absent from the
  `VisibleFields` type (always ignored at runtime), and a `visibleFields` object
  mistakenly nested _inside_ `document`.

⚠️ **One behavior change:** DocumentListItem's **"With Many Projects"** story had
`visibleFields: { ...defaultVisibleFields, thumbnail: true }` nested inside
`document` (so it never applied). Promoted to a sibling arg to honor intent —
this story **now renders thumbnails** where it previously didn't. Revisit if a
Chromatic baseline needs the old render (alternative: drop the key entirely for a
byte-identical render).

## Effort estimate

- **Core upgrade + addon cleanup + `$app/state` verify:** ~0.5–1 day, _if_
  both third-party addons cooperate.
- **`storybook-addon-cookie` replacement** (if it breaks): +0.5 day.
- **~~35 legacy-story migration:~~** ✅ done (2026-07-17), 42 files.

## Recommendation

Do the SB9 core upgrade + addon consolidation + `$app/state` verification as one
focused PR, keeping the legacy-CSF migration separate. The only real unknown is
`storybook-addon-cookie`; validate it (or its replacement) early since it gates
every MSW-backed story. SB9 (not SB10) is the conservative target — SB10 exists
but adds churn without solving our motivating problem.

## List A — old `Story`/`Template` API → `defineMeta` (24)

These `import { Story, Template } from "@storybook/addon-svelte-csf"` and have no
`defineMeta`.

```
src/lib/components/documents/stories/CustomizeEmbed.stories.svelte
src/lib/components/documents/stories/Data.stories.svelte
src/lib/components/documents/stories/DocumentListItem.stories.svelte
src/lib/components/documents/stories/Header.stories.svelte
src/lib/components/documents/stories/Highlight.stories.svelte
src/lib/components/documents/stories/HighlightGroup.stories.svelte
src/lib/components/documents/stories/Metadata.stories.svelte
src/lib/components/documents/stories/NoteHighlights.stories.svelte
src/lib/components/documents/stories/PageHighlights.stories.svelte
src/lib/components/documents/stories/Pending.stories.svelte
src/lib/components/documents/stories/Projects.stories.svelte
src/lib/components/documents/stories/Revisions.stories.svelte
src/lib/components/documents/stories/Thumbnail.stories.svelte
src/lib/components/premium-credits/stories/CreditMeter.stories.svelte
src/lib/components/premium-credits/stories/PremiumBadge.stories.svelte
src/lib/components/premium-credits/stories/Price.stories.svelte
src/lib/components/premium-credits/stories/UpgradePrompt.stories.svelte
src/lib/components/projects/stories/Collaborators.stories.svelte
src/lib/components/projects/stories/ProjectHeader.stories.svelte
src/lib/components/projects/stories/ProjectListItem.stories.svelte
src/lib/components/projects/stories/ProjectShare.stories.svelte
src/routes/embed/stories/note-embed.stories.svelte
src/routes/embed/stories/page-embed.stories.svelte
src/routes/embed/stories/project-embed.stories.svelte
```

## List B — `<script context="module">` → `<script module>` (35)

```
src/lib/components/common/stories/Access.stories.svelte
src/lib/components/common/stories/Action.stories.svelte
src/lib/components/common/stories/Badge.stories.svelte
src/lib/components/common/stories/Button.stories.svelte
src/lib/components/common/stories/Card.stories.svelte
src/lib/components/common/stories/Empty.stories.svelte
src/lib/components/common/stories/Error.stories.svelte
src/lib/components/common/stories/FieldLabel.stories.svelte
src/lib/components/common/stories/Flex.stories.svelte
src/lib/components/common/stories/KV.stories.svelte
src/lib/components/common/stories/Logo.stories.svelte
src/lib/components/common/stories/Paginator.stories.svelte
src/lib/components/common/stories/Pin.stories.svelte
src/lib/components/common/stories/RelativeTime.stories.svelte
src/lib/components/common/stories/Tab.stories.svelte
src/lib/components/common/stories/Toast.stories.svelte
src/lib/components/common/stories/Tooltip.stories.svelte
src/lib/components/documents/search/stories/SearchEditor.stories.svelte
src/lib/components/documents/stories/CustomizeEmbed.stories.svelte
src/lib/components/documents/stories/Data.stories.svelte
src/lib/components/documents/stories/DocumentListItem.stories.svelte
src/lib/components/documents/stories/Header.stories.svelte
src/lib/components/documents/stories/Metadata.stories.svelte
src/lib/components/documents/stories/NoteHighlights.stories.svelte
src/lib/components/documents/stories/PageHighlights.stories.svelte
src/lib/components/documents/stories/Pending.stories.svelte
src/lib/components/documents/stories/Projects.stories.svelte
src/lib/components/documents/stories/Revisions.stories.svelte
src/lib/components/documents/stories/Thumbnail.stories.svelte
src/lib/components/projects/stories/Collaborators.stories.svelte
src/lib/components/projects/stories/ProjectHeader.stories.svelte
src/lib/components/projects/stories/ProjectShare.stories.svelte
src/routes/embed/stories/note-embed.stories.svelte
src/routes/embed/stories/page-embed.stories.svelte
src/routes/embed/stories/project-embed.stories.svelte
```
