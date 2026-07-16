# Viewer State Migration: Stores → `ViewerState` class

## Goal

Replace the grab-bag of Svelte stores/context values currently created and
provided by [`ViewerContext.svelte`](../src/lib/components/viewer/ViewerContext.svelte)
with the single runes-based [`ViewerState`](../src/lib/state/viewer.svelte.ts)
class, provided through `getViewerState` / `setViewerState`.

## Current situation

`ViewerContext.svelte` does two jobs today:

1. **Provider** — creates ~12 context entries (a mix of `writable` stores and
   plain values) and exposes a typed `getX()` accessor for each.
2. **Controller** — owns side effects: PDF loading with 403 retry, hash-based
   scrolling, and `afterNavigate` URL syncing.

### Context entries provided today

| Context key   | Type today                               | In `ViewerState`?         |
| ------------- | ---------------------------------------- | ------------------------- |
| `document`    | `Writable<Document>`                     | ✅ `document` (Nullable)  |
| `text`        | `Promise<Maybe<DocumentText>>` (plain)   | ❌ **missing**            |
| `asset_url`   | `URL` (plain)                            | ❌ **missing**            |
| `embed`       | `boolean` (plain)                        | ❌ **missing**            |
| `newNote`     | `Writable<Nullable<Partial<Note>&BBox>>` | ⚠️ `newNote` (wrong type) |
| `currentNote` | `Writable<Nullable<Note>>`               | ✅ `currentNote`          |
| `currentPage` | `Writable<number>`                       | ✅ `page`                 |
| `currentMode` | `Writable<ViewerMode>`                   | ✅ `mode`                 |
| `pdf`         | `Writable<Promise<PDFDocumentProxy>>`    | ✅ `pdf` (plain promise)  |
| `progress`    | `Writable<DocumentLoadProgress>`         | ✅ `progress`             |
| `zoom`        | `Writable<Zoom>`                         | ❌ **missing**            |
| `errors`      | `Writable<Error[]>`                      | ✅ `errors`               |

Note `getZoomLevels` in `src/lib/utils/viewer.ts` is unrelated — leave it alone.

### Consumers (all read via `getX()` accessors)

Producers/providers: two route pages + all Storybook stories render
`<ViewerContext ...>`.

Consumers (call the `getX()` accessors):

- `viewer/PDF.svelte` — document, currentPage, pdf, zoom, errors (reads `$errors`,
  writes via `errors.update`)
- `viewer/PDFPage.svelte` — document, currentMode, pdf
- `viewer/Page.svelte` — currentMode, currentPage, document, embed
- `viewer/Text.svelte` — text, currentPage, zoom
- `viewer/Zoom.svelte` — currentMode, zoom (**writes** `$zoom`, `bind:value={$zoom}`)
- `viewer/Grid.svelte` — document, zoom
- `viewer/Search.svelte` — document
- `viewer/Notes.svelte` — document
- `viewer/AnnotationLayer.svelte` — currentMode, currentNote, document, newNote,
  embed (**heavy writer**: `$newNote`, `$currentNote`, `documentStore.update`)
- `viewer/Viewer.svelte` — currentMode, progress, embed
- `notes/Note.svelte` — currentMode, document (as prop default), embed
- `notes/NoteExcerpt.svelte` — pdf
- `sidebar/ViewerActions.svelte` — currentPage
- `toolbars/PaginationToolbar.svelte` — currentMode, currentPage, document, embed
  (**writes** `$currentPage`, `bind:page={$currentPage}`)
- `toolbars/ReadingToolbar.svelte` — currentMode, document, embed
- `toolbars/RedactionToolbar.svelte` — document
- `layouts/DocumentLayout.svelte` — document, text (as prop defaults)
- `embeds/DocumentEmbed.svelte` — document (uses legacy `$:` reactivity)

## Design decisions

### 1. Keep `ViewerContext.svelte` as a thin provider + controller

**Recommended.** A plain `.svelte.ts` class cannot use `onMount`,
`afterNavigate`, or `<svelte:window on:hashchange>`. Rather than scatter those,
keep `ViewerContext.svelte` but rewrite its body to:

- accept the same props (so **route pages and stories barely change**),
- construct one `ViewerState`, populate it, and call `setViewerState(state)`,
- host the lifecycle/controller logic (PDF load, hash scroll, `afterNavigate`).

This localizes churn to the leaf components' _reads_, and keeps the ~10 story
files and 2 route pages working with minimal edits.

Delete the module-script `getX()` exports — every consumer switches to
`getViewerState()`.

While rewriting the body, also **upgrade `ViewerContext.svelte` to Svelte 5
runes syntax** (it's still Svelte 4: `context="module"`, `export let`, `$:`,
store `$` prefixes, `<slot />`, `on:` directives). See Phase 2 for the concrete
steps.

### 2. Extend `ViewerState` to cover all data

Add the four missing fields and fix `newNote`:

```ts
// additions to ViewerState
text: Promise<Maybe<DocumentText>> = $state(new Promise(() => {}));
assetUrl: Nullable<URL> = $state(null); // was context "asset_url"
embed: boolean = $state(false);
zoom: Zoom = $state(1);
// fix existing field's type to match AnnotationLayer's partial writes:
newNote: Nullable<Partial<Note> & BBox> = $state(null);
```

**`document` nullability — resolved (see Confirmed decisions):** the field stays
`Nullable<Document>`. The provider assigns it before children render; consumers
read `viewer.document` and add a non-null assertion at the few sites TS flags.
No non-null getter. (Implemented in Phase 1: the field is `Nullable<Document>`.)

### 3. Move controller logic

- `loadPDF(assetUrl)` (with 403 retry) → a **method on `ViewerState`** that sets
  `this.pdf`, `this.progress`, and pushes to `this.errors`. Called from the
  provider's `onMount`.
- `scrollToHash` / `onHashChange` / `afterNavigate` → stay in
  `ViewerContext.svelte`, mutating `state.page` / `state.currentNote` /
  `state.mode` directly instead of `$store` assignments.

## Migration steps

> **Status (as of this update):**
> ✅ **Phase 1 complete** (class extended).
> ✅ **Test safety net in place** (see section below).
> ✅ **Phase 2 complete** — provider rewritten to construct `ViewerState` +
> `setViewerState`, Svelte 5 syntax, `getX()` exports deleted.
> ✅ **Phase 3 complete** — all consumers read `getViewerState()`.
> ✅ **Phase 4 complete** — routes/stories updated (embed route passes `embed`;
> stories pass `asset_url` instead of a `pdf` writable).
> ✅ **Phase 5** — `npm run check` clean (0 errors), full unit suite green
> (981 pass / 9 todo). Manual browser spot-check still recommended.
>
> **Two implementation notes worth remembering:**
>
> 1. **Seeding must be synchronous, not a parent `$effect`.** An initial attempt
>    to sync all props into the state via a single parent `$effect` (mirroring
>    `SearchState`) failed two safety-net tests: children read `viewer.document`
>    on their first render (before a parent effect runs → null crash), and a
>    parent effect running after child effects clobbered child-computed state
>    (`Zoom` writes `viewer.zoom`, then the parent reset it). Final approach:
>    seed synchronously inside a `seedState()` function (ordinary reads, so no
>    `state_referenced_locally` warning), and reactively re-sync only
>    `document` via `$effect` (the only field the old code synced reactively).
> 2. **Annotation embed route now provides a real `ViewerContext`, but stays
>    lightweight.** `embed/documents/[id]/annotations/[note_id]/+page.svelte`
>    used to hand-roll context and pass `pdf: undefined`, so `NoteExcerpt`
>    rendered from a page image. `Note`/`NoteExcerpt` now require
>    `getViewerState()` (which throws without a provider), so the route wraps the
>    note in `ViewerContext` — with **`loadPdf={false}`**. `ViewerState.pdf` is
>    `Nullable`; `loadPdf={false}` seeds it to `null`, and `NoteExcerpt` falls
>    back to `renderImage` when `pdf` is null. So the embed still loads only a
>    single page image, never the full PDF (covered by
>    `notes/tests/NoteExcerpt.test.ts`).

### Phase 1 — Extend the class ([viewer.svelte.ts](../src/lib/state/viewer.svelte.ts)) — ✅ DONE

1. ✅ Added `text`, `assetUrl`, `embed`, `zoom` `$state` fields.
2. ✅ Changed `newNote` type to `Nullable<Partial<Note> & BBox>`.
3. ✅ Added a `loadPDF(url: URL)` method (ported the 403-retry logic), mutating
   `this.pdf/progress/errors` and using private `#task` / `#retriesOn403Error`
   fields. Also moved the pdfjs worker-src init to module scope.
4. Skipped the optional constructor/`init(props)` — the provider (Phase 2) will
   assign fields directly.

### Phase 2 — Rewrite the provider ([ViewerContext.svelte](../src/lib/components/viewer/ViewerContext.svelte)) — ✅ DONE

This phase also **migrates `ViewerContext.svelte` to Svelte 5 runes syntax**. The
component is still written in Svelte 4 style (`<script context="module">`,
`export let`, `$:`, store `$` prefixes, `<slot />`, `on:` directives); the rewrite
brings it in line with the runes conventions used elsewhere.

1. Delete the entire module `<script context="module">` block of `getX()`
   exports (lines 42–89). No module script remains — `getViewerState` /
   `setViewerState` are imported from `$lib/state/viewer.svelte`.
2. Convert props from `export let` to a single `$props()` destructure with an
   interface. Keep the same prop names (`document`, `text`, `note`, `asset_url`,
   `embed`, `page`, `mode`, `zoom`, `errors`; the legacy `pdf` writable prop is
   dropped — the state owns the PDF promise now).
3. Construct `const state = new ViewerState()`, populate fields from props
   (mapping `asset_url` → `state.assetUrl`), call `setViewerState(state)`.
4. Replace the `documentStore` + `$: documentStore.set(document)` reactivity with
   `$effect(() => { state.document = document; })` (and same for any other prop
   that should track its source).
5. Port the controller logic to runes:
   - `onMount(() => loadPDF(asset_url))` → `onMount(() => state.loadPDF(state.assetUrl!))`.
   - `scrollToHash` / `onHashChange` / `afterNavigate` handlers rewritten to
     mutate `state.page` / `state.currentNote` / `state.mode` directly instead of
     `$store` assignments.
6. Syntax cleanup: `<slot />` → `{@render children?.()}` (add `children` to
   `$props()`); `<svelte:window on:hashchange=… on:popstate=…>` →
   `onhashchange` / `onpopstate` attribute form; read `page` from `$app/state`
   instead of the `$app/stores` `$page` store where practical.

### Phase 3 — Migrate consumers — ✅ DONE

Uniform transform in each consumer:

```ts
// before
import { getDocument, getCurrentPage } from ".../ViewerContext.svelte";
const documentStore = getDocument();
const currentPage = getCurrentPage();
let document = $derived($documentStore);
...$currentPage...

// after
import { getViewerState } from "$lib/state/viewer.svelte";
const viewer = getViewerState();
let document = $derived(viewer.document);   // or read viewer.document directly
...viewer.page...
```

Store-write → field-assignment map:

| Old store op                                  | New                                               |
| --------------------------------------------- | ------------------------------------------------- |
| `$currentPage = n`                            | `viewer.page = n`                                 |
| `$mode` / `$currentMode`                      | `viewer.mode`                                     |
| `$zoom`                                       | `viewer.zoom`                                     |
| `$currentNote = x` / `$newNote = x`           | `viewer.currentNote` / `viewer.newNote`           |
| `bind:value={$zoom}` (Zoom)                   | `bind:value={viewer.zoom}`                        |
| `bind:page={$currentPage}` (Paginator)        | `bind:page={viewer.page}`                         |
| `errors.update(u => [...u, e])` (PDF)         | `viewer.errors = [...viewer.errors, e]`           |
| `documentStore.update(...)` (AnnotationLayer) | `viewer.document = { ...viewer.document, notes }` |
| `getText()` (Text, DocumentLayout)            | `viewer.text`                                     |
| `getDocument()` default prop (Note)           | `getViewerState().document`                       |

Per-file notes:

- **AnnotationLayer.svelte** — biggest change; many `$newNote`/`$currentNote`
  reads/writes and the optimistic `documentStore.update` in `onEditNoteSuccess`.
- **Zoom.svelte** — `$effect` writing `$zoom` and `bind:value={$zoom}`.
- **PaginationToolbar.svelte** — `next/previous/gotoPage` write `$currentPage`;
  `bind:page`.
- **PDF.svelte** — `getErrors()` returns the store today and code calls
  `errors.update`; switch to array assignment. Also `$errors` reads in markup.
- **NoteExcerpt.svelte** — `type AsyncPDF = typeof $pdf` and `$pdf` reads →
  `viewer.pdf`.
- **Note.svelte** / **DocumentLayout.svelte** — default `$props()` values pull
  from context getters; replace with `getViewerState()`.
- **DocumentEmbed.svelte** — still uses legacy `$:`; migrate that line to
  `$derived` while switching to `viewer.document`.

### Phase 4 — Providers (routes + stories) — ✅ DONE

- **Route pages** (`(app)/documents/[id]-[slug]/+page.svelte`,
  `embed/documents/[id]-[slug]/+page.svelte`): unchanged if provider keeps the
  same prop names (`document`, `mode`, `text`, `asset_url`).
- **Stories** (~10 files): unchanged _except_ any passing
  `pdf={writable(load(url))}` — the provider now takes a plain promise, so change
  to `pdf={load(url)}` in `PDFPage.stories.svelte` and `Note.stories.svelte`.

### Phase 5 — Verify — ✅ (typecheck + unit tests; manual spot-check pending)

1. `npm run check` (svelte-check / TS) — expect to chase down `Nullable<Document>`
   assertions.
2. `npm run test:unit` — the tests below must stay green across the migration.
   Update snapshots only if markup is unchanged but wrappers differ
   (`npm run test:unit -- -u`).
3. `npm run storybook` — spot-check Viewer, PDF, Notes, Zoom, Search stories.
4. Manual: load a document viewer (logged-in and embed) at
   https://www.dev.documentcloud.org/, exercise pagination, zoom, note
   create/edit, hash navigation.

## Test safety net — ✅ DONE (before Phase 2)

The affected components previously had **no** unit coverage. All component tests
render through the **real `ViewerContext`** via the `renderInViewer` helper,
seeding state through the provider's public props and mocking only external deps
(`pdfjs` = network, `$app/*` = router). Because they exercise the provider's
public interface — not reproduced context keys — they are expected to pass
**unchanged** after Phase 2 swaps the internals to `ViewerState`. Real fixtures
from `src/test/fixtures/` are used throughout (no hand-rolled document/note/text
data).

Harness:

- **`src/lib/components/viewer/tests/ViewerHarness.svelte`** +
  **`renderInViewer.ts`** — renders any child inside `ViewerContext`, forwarding
  context props (`document`, `mode`, `zoom`, `page`, `embed`, `note`, `text`,
  `errors`).

Unit tests for the class:

- **`src/lib/state/tests/viewer.test.svelte.ts`** (8) — defaults,
  `loadingProgress`, `loadPDF` success / progress wiring / idempotence /
  403-retry / non-403 error / retry cap. Mocks `pdfjs` + documents API.

Component tests (all green; the state reads/writes each covers are the migration
surface):

| Test                                           | Covers                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `viewer/tests/Zoom.test.ts` (4)                | option sets + default zoom per mode; the `bind:value` write                        |
| `viewer/tests/Notes.test.ts` (3)               | empty-state CTA gated on edit access; one entry per note                           |
| `viewer/tests/Grid.test.ts` (1)                | one linked thumbnail per page in the spec                                          |
| `viewer/tests/Text.test.ts` (2)                | text block per page (async); `--zoom` custom property                              |
| `viewer/tests/Search.test.ts` (2)              | result card per matching page; empty state                                         |
| `viewer/tests/AnnotationLayer.test.ts` (3)     | renders page notes; writing mode; **draw box + Escape-to-close** (the note writer) |
| `viewer/tests/PDF.test.ts` (2)                 | one page wrapper per page; error view when `errors` seeded                         |
| `viewer/tests/Page.test.ts` (3)                | page-number link; `PageActions` gated on `embed`                                   |
| `notes/tests/Note.test.ts` (5)                 | title/content; footer + close-button gating on `embed`/`mode`                      |
| `toolbars/tests/PaginationToolbar.test.ts` (3) | page-write path: next/prev enable/disable; page follows `next`                     |

`notes/tests/NoteExcerpt.test.ts` (2) was added during Phase 3 to pin the
image-vs-PDF render decision (spies on `renderImage`/`renderPDF`), guarding that
a `loadPdf={false}` embed renders from an image and never fetches the PDF.

Deliberately **not** unit-tested (better via Storybook/e2e): `Viewer`
(routing — low migration risk), `ReadingToolbar` (`clientWidth`-driven
breakpoints are unreliable in jsdom), `PDFPage` (canvas-only). Still untested if
coverage is extended later: `RedactionToolbar`, `ViewerActions`,
`DocumentLayout`, `DocumentEmbed`.

Each test mocks only genuinely external deps (`pdfjs` = network, `$app/*` =
router). When migrating, keep `ViewerContext`'s prop names stable so
`renderInViewer` and these tests need no changes.

## Confirmed decisions

1. **`document` nullability** — ✅ Keep the field `Nullable<Document>`. The
   provider assigns it before children render; consumers read `viewer.document`
   and add a non-null assertion at the few call sites TS flags. No non-null
   getter.
2. **Keep `ViewerContext.svelte`** — ✅ Keep it as the thin provider + controller.
   Do not inline `new ViewerState()` / `setViewerState()` into routes/stories.
3. **Field naming** — ✅ Use `assetUrl` (camelCase) for the class field and all
   internal usage. The **provider prop stays `asset_url`** because that is the
   backend API's field name (`data.asset_url` flows straight through the route
   pages). The provider maps prop `asset_url` → `state.assetUrl`.

## Behavioral changes from the refactor

Most of the migration is behavior-preserving (store reads → field reads,
`$store =` writes → `state.x =` writes). The changes that are _not_ pure
refactors:

1. **Annotation embed: no behavior change (verified & tested).** The single-note
   embed still renders from a page image and never fetches the full PDF. It used
   to hand-roll context with `pdf: undefined`; it now uses a real
   `ViewerContext` with `loadPdf={false}`, which seeds `ViewerState.pdf` (made
   `Nullable`) to `null` so `NoteExcerpt` falls back to `renderImage`. Pinned by
   `notes/tests/NoteExcerpt.test.ts` (image path + no PDF fetch when there's no
   PDF; PDF path when there is one). `PDF.svelte`/`PDFPage.svelte` assert
   non-null `pdf` since they only render in a PDF-loading viewer.

2. **Annotation embed viewer mode `"note"` → `"notes"`.** The old code set an
   invalid `currentMode` of `"note"` (untyped context tolerated it); the provider
   prop is typed `ViewerMode`, so it is now `"notes"`. Only affected the CSS
   class on the note wrapper (`note {mode}`); no rule keys on that class, so no
   visual change.

3. **Embedded-ness now flows from the route, not `DocumentEmbed`.** Previously
   `DocumentEmbed` called `setContext("embed", true)`. Now the embed route passes
   `embed` to `ViewerContext`. Same net scope (DocumentEmbed wraps the whole
   viewer subtree), so no user-facing change — but the signal's origin moved.

Explicitly **not** changed (verified): the reactive-sync surface matches the old
code — only `document` re-syncs reactively (old code only did
`documentStore.set(document)`); `text`/`asset_url` are still seeded once (so the
pre-existing "stale text/asset_url if ViewerContext isn't remounted between
documents" behavior is preserved, not introduced); `loadPDF` still runs once in
`onMount`; `errors`, `zoom`, `page`, note create/edit all behave as before. The
`$app/stores` `$page` → `$app/state` `page` swap in the provider is
behaviorally equivalent (both track navigation).
