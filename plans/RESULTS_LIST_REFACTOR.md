# Phase 2: Extract loading/pagination from ResultsList, make it presentational

> **Phase 2** of a two-phase refactor. Builds on Phase 1 ([RESULTS_CONTEXT_REFACTOR.md](RESULTS_CONTEXT_REFACTOR.md)), which moves selection state into a `SearchResultsState` class. This phase extends that class with pagination state and makes `ResultsList` a fully presentational component.

## Current state: `src/lib/state/search.svelte.ts`

The `SearchResultsState` class combines:

- **Selection**: `visible` (SvelteMap), `selectedIds` (SvelteSet), `selected` (getter), `editable` (getter), `total`
- **Pagination**: `next`, `loading`, `query`, `options`
- **Methods**: `load(query, options?, fetch?)`, `setResults(getter)`, `loadNext()`, `selectAll()`, `deselectAll()`
- **Store watching**: `watch(stores)`, `unwatch()`, `applyWatched()` — subscribes to external stores (`deleted`, `edited`, `pending`, `finished`) and patches `visible` reactively
- **Handlers**: `handleDeleted`, `handleEdited`, `handlePending`, `handleFinished` — called by store subscriptions and by `applyWatched()` after loading results
- **Constructor**: accepts optional `{ loading }` to set initial loading state

Results live in the `visible` SvelteMap (keyed by document ID). Context pair: `[getSearchResults, setSearchResults]`.

## Progress

### 1. `src/lib/state/search.svelte.ts` — DONE

- Pagination fields: `next`, `loading`, `query`, `options`
- `load(query, options?, fetch?)` — loads via API, clears previous
- `setResults(getter)` — accepts `() => Promise<APIResponse<DocumentResults>>`, populates state
- `loadNext()` — fetches next page, appends to `visible`, returns error message on failure
- `watch(stores)` — subscribes to `deleted`, `edited`, `pending`, `finished` stores; handlers patch `visible` in place
- `applyWatched()` — re-reads current store values via `get()` and re-applies handlers; called after `setResults`, `load`, and `loadNext` to ensure freshly loaded results respect current store state
- `unwatch()` — unsubscribes from all watched stores (wired to `onDestroy` in routes)

### 2. `src/lib/components/documents/ResultsList.svelte` — DONE

- Takes `search: SearchResultsState` as a **required prop**
- Reads `search.visible`, `search.next`, `search.loading` (no local state for these)
- Template iterates `search.visible.values()`
- `onNext?: () => Promise<Maybe<string>>` callback prop for pagination
- IntersectionObserver calls `onNext()` when `auto` is true
- Keeps `auto`, `preload`, `start`, `end` as props (UI concerns)

### 3. `src/lib/components/layouts/DocumentBrowser.svelte` — DONE

- Gets `search` from context via `getSearchResults()`, or accepts as optional prop
- Passes `search` prop to `<ResultsList {search} auto>`
- Selection reads from search state (selectAll, deselectAll, selected, visible, editable, total)
- `fixResults` and helpers (`excludeDeleted`, `patchEdited`, `setPendingStatus`) removed — logic moved to `SearchResultsState.watch()`
- `documents` prop still declared in interface but unused (cleanup candidate)

### 4. `src/lib/components/addons/DocumentList.svelte` — DONE

- Removed `search: Promise` prop entirely — no longer receives raw promise
- Gets `searchState` from context via `getSearchResults()`
- Shows loading state via `searchState.loading && searchState.visible.size === 0`
- Passes `search={searchState}` to `<ResultsList>`

### 5. `src/lib/components/layouts/AddOnLayout.svelte` — DONE

- Removed `search: Promise<Maybe<DocumentResults>>` prop
- Gets `search` from context via `getSearchResults()`
- `Selection` reads `search.total` directly instead of awaiting a promise
- `DocumentList` no longer receives `search` prop (reads from context)
- Removed unused `DocumentResults` type import

### 6. Routes — DONE

All `(app)` routes create `SearchResultsState`, set context, call `search.watch()` with stores, and wire `onDestroy(search.unwatch)`:

- **`/documents/+page.svelte`**: Creates state, calls `setResults(() => data.searchResults)`, watches `deleted`, `edited`, `pending`, `finished`
- **`/add-ons/[owner]/[repo]/+page.svelte`**: Same pattern. Removed `{search}` prop from `<AddOnLayout>`
- **`/add-ons/[owner]/[repo]/[event]/+page.svelte`**: Same pattern, wraps `data.searchResults` into `{ data }` for `setResults`. Removed `{search}` from `<AddOnLayout>`
- **`/projects/[id]-[slug]/+page.svelte`**: Same pattern
- **`/embed/projects/[project_id]-[slug]/+page.svelte`**: No `watch()` — outside `ProcessContext`, read-only embed

### 7. Test/demo files — DONE

- **`ResultsList.demo.svelte`**: Thin test harness — creates `SearchResultsState` from `results` prop, sets up `embed` + `visibleFields` contexts, passes `search` to `<ResultsList>`
- **`ResultsList.test.ts`**: 4 tests passing. Empty state test uses default empty `results`
- **`ResultsList.stories.svelte`**: Module script creates `SearchResultsState` instances. Instance script sets up `embed` + `visibleFields` contexts. Each story passes `search` directly

### 8. Layout stories — DONE

- **`DocumentBrowser.stories.svelte`**: Creates populated + empty `SearchResultsState`, sets context
- **`AppLayout.stories.svelte`**: Creates populated `SearchResultsState`, sets context, passes `{search}` to `DocumentBrowser`
- **`AddOnLayout.stories.svelte`**: Creates populated `SearchResultsState`, sets context + `embed` + `visibleFields`
- **`Project.stories.svelte`**: Creates populated `SearchResultsState`, sets context
- **`DocumentList.stories.svelte`**: New file (untracked)

## Key design decisions

1. **`search` is a required prop on `ResultsList`** — explicit, testable, no context coupling. Parent components (`DocumentBrowser`, `DocumentList`) get state from context and pass it down.
2. **`onNext` is a callback prop** — pagination behavior via props keeps ResultsList testable without a real fetch.
3. **`visible` is a SvelteMap** — keyed by document ID for deduplication and O(1) selection lookup. Iteration order is insertion order.
4. **`setResults` accepts a promise-returning getter** — lets routes pass `() => data.searchResults` without awaiting upfront.
5. **`loadNext` returns an error message** — ResultsList displays errors locally without needing error state on the class.
6. **IntersectionObserver stays in ResultsList** — scroll detection is a UI concern.
7. **State created at page/route level** — high enough for sidebar siblings to access via context.
8. **`AddOnLayout` and `DocumentList` dropped `search` promise prop** — they read from context instead. Loading state uses `searchState.loading` rather than `{#await}`.
9. **Store watching uses `.subscribe()`, not `$effect`** — works outside component init context. Handlers mutate `visible` in place so selection, display, and pagination all reference the same data.
10. **`applyWatched()` re-applies after loading** — prevents race where `invalidateAll` repopulates `visible` from stale API data after a store change (e.g. deleted doc reappearing).
11. **`ConfirmDelete` uses `deleted.update()` instead of `$deleted.add()`** — ensures store subscribers are notified even inside `use:enhance` callbacks where Svelte 4's compiler may not instrument `$store` mutations.

## Remaining work

### Remove `documents` prop from DocumentBrowser

The `documents: Promise<APIResponse<DocumentResults, any>>` prop is declared in `Props` but never destructured or used. Callers still pass it (`/documents`, `/embed/projects`, stories). Remove the prop and update all callers. This also removes the `APIResponse` and `DocumentResults` type imports.

### Audit other `$store.mutate()` patterns

`ConfirmDelete` needed `deleted.update()` instead of `$deleted.add()` to ensure store subscribers fire inside `use:enhance` callbacks. Other Svelte 4 components that mutate stores inside returned callbacks may have the same issue — check `edited.update()` usage in edit forms.

## Verification

1. `npm run test:unit` — 365 tests pass (44 test files)
2. `npm run check` — 0 errors, 0 warnings
3. `npm run storybook` — stories render with per-story state
4. Manual testing:
   - [x] Document deletion (optimistic removal from results)
   - [ ] Document search
   - [ ] Infinite scroll / "load more" button
   - [ ] Select-all / bulk actions
   - [ ] Addon document list
   - [ ] Embed view
   - [ ] Document editing (title, access, etc.) reflected in results
   - [ ] Processing status updates (pending → success)
