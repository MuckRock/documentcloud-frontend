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

Decision to confirm: **`document` nullability.** The class defaults to
`null`, but every consumer treats it as always-present (`document.page_count`,
etc.). Options: (a) keep `Nullable`, assign in the provider, and have consumers
read `viewer.document` with the understanding it's set before children mount
(add a `!` or a getter that throws if unset); or (b) add a `get doc(): Document`
that asserts non-null for ergonomic child use. Recommend a non-null
`get document()` accessor is overkill — simplest is to keep the field, assign it
in the provider before rendering `<slot/>`, and let consumers read
`viewer.document` (TS may need a non-null assertion at a few call sites).

### 3. Move controller logic

- `loadPDF(assetUrl)` (with 403 retry) → a **method on `ViewerState`** that sets
  `this.pdf`, `this.progress`, and pushes to `this.errors`. Called from the
  provider's `onMount`.
- `scrollToHash` / `onHashChange` / `afterNavigate` → stay in
  `ViewerContext.svelte`, mutating `state.page` / `state.currentNote` /
  `state.mode` directly instead of `$store` assignments.

## Migration steps

### Phase 1 — Extend the class ([viewer.svelte.ts](../src/lib/state/viewer.svelte.ts))

1. Add `text`, `assetUrl`, `embed`, `zoom` `$state` fields.
2. Change `newNote` type to `Nullable<Partial<Note> & BBox>`.
3. Add a `loadPDF(assetUrl: URL)` method (port logic from
   `ViewerContext.svelte` lines 168–192), mutating `this.pdf/progress/errors`.
4. Optionally a constructor / `init(props)` that takes the initial
   document/text/asset_url/embed/mode/page/zoom/errors.

### Phase 2 — Rewrite the provider ([ViewerContext.svelte](../src/lib/components/viewer/ViewerContext.svelte))

1. Delete the entire module `<script context="module">` block of `getX()`
   exports (lines 42–89).
2. In the instance script: keep the same `export let` props; construct
   `const state = new ViewerState()`, populate fields from props, call
   `setViewerState(state)`.
3. Keep `documentStore.set` behavior as `$effect(() => state.document = document)`.
4. Port `onMount(() => state.loadPDF(asset_url))`, the `<svelte:window>`
   hashchange/popstate handlers, and `afterNavigate` — rewritten to mutate
   `state.*`.

### Phase 3 — Migrate consumers

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

### Phase 4 — Providers (routes + stories)

- **Route pages** (`(app)/documents/[id]-[slug]/+page.svelte`,
  `embed/documents/[id]-[slug]/+page.svelte`): unchanged if provider keeps the
  same prop names (`document`, `mode`, `text`, `asset_url`).
- **Stories** (~10 files): unchanged _except_ any passing
  `pdf={writable(load(url))}` — the provider now takes a plain promise, so change
  to `pdf={load(url)}` in `PDFPage.stories.svelte` and `Note.stories.svelte`.

### Phase 5 — Verify

1. `npm run check` (svelte-check / TS) — expect to chase down `Nullable<Document>`
   assertions.
2. `npm run test:unit` — the tests below must stay green across the migration.
   Update snapshots only if markup is unchanged but wrappers differ
   (`npm run test:unit -- -u`).
3. `npm run storybook` — spot-check Viewer, PDF, Notes, Zoom, Search stories.
4. Manual: load a document viewer (logged-in and embed) at
   https://www.dev.documentcloud.org/, exercise pagination, zoom, note
   create/edit, hash navigation.

## Test safety net (added before migration)

The affected components previously had **no** unit coverage. Added:

- **`src/lib/state/tests/viewer.test.svelte.ts`** — unit tests for `ViewerState`
  (defaults, `loadingProgress`, `loadPDF` success / progress wiring / idempotence
  / 403-retry / non-403 error / retry cap). Mocks `pdfjs` and the documents API.
- **`src/lib/components/viewer/tests/ViewerHarness.svelte`** +
  **`renderInViewer.ts`** — a generic helper that renders any component inside
  the **real `ViewerContext`** provider, seeding state via its public props.
  Because it goes through the provider (not reproduced context keys), these
  tests are expected to pass **unchanged** after the internal migration.
- **`viewer/tests/Zoom.test.ts`** — zoom option sets + defaults per mode.
- **`viewer/tests/Notes.test.ts`** — empty-state CTA gated on edit access; one
  entry per note.
- **`toolbars/tests/PaginationToolbar.test.ts`** — page-write path: next/prev
  enable/disable and the displayed page following `next`.

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
