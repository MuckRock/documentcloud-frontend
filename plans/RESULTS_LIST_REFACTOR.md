# Phase 2: Extract loading/pagination from ResultsList, make it presentational

> **Phase 2** of a two-phase refactor. Builds on Phase 1 ([RESULTS_CONTEXT_REFACTOR.md](RESULTS_CONTEXT_REFACTOR.md)), which moves selection state into a `SearchResultsState` class. This phase extends that class with pagination state and makes `ResultsList` a fully presentational component.
>
> **Prerequisite**: Phase 1 must be completed first. All pre-refactor tests described in that plan should be passing.

## Context

After Phase 1, `ResultsList.svelte` still owns loading/pagination (`load()`, `watch()`, `unwatch()`, `IntersectionObserver`) and receives `results`, `count`, `next` as props. This phase moves pagination state into the `SearchResultsState` class so `ResultsList` becomes presentational — it receives a `SearchResultsState` as a prop and delegates loading to an `onNext` callback prop.

## Current state: `src/lib/state/search.svelte.ts`

The `SearchResultsState` class combines:

- **Selection**: `visible` (SvelteMap), `selectedIds` (SvelteSet), `selected` (getter), `editable` (getter), `total`
- **Pagination**: `next`, `loading`, `query`, `options`
- **Methods**: `load(query, options?, fetch?)`, `setResults(getter)`, `loadNext()`, `selectAll()`, `deselectAll()`

> Note: results live in the `visible` SvelteMap (keyed by document ID), not a separate `results` array. The original plan's `setInitialPage` is now `setResults`, and `loadMore` is now `loadNext`. There is no separate `PageTransform` — the class handles document indexing internally.

Context pair: `[getSearchResults, setSearchResults]` — still exported for sidebar components that need access without a direct prop.

## Progress

### 1. `src/lib/state/search.svelte.ts` — DONE

- Added pagination fields: `next`, `loading`, `query`, `options`
- Added `load(query, options?, fetch?)` — loads initial results via API, clears previous
- Added `setResults(getter)` — accepts a promise-returning function, populates `visible` map, sets `total` and `next`
- Added `loadNext()` — fetches next page URL, appends to `visible` map, returns error message on failure
- No `PageTransform` callback — document indexing into the `visible` map handles deduplication naturally

### 2. `src/lib/components/documents/ResultsList.svelte` — DONE

- Takes `search: SearchResultsState` as a **required prop** (not from context)
- Removed `results`, `count`, `next`, `loading` props — reads `search.visible`, `search.total`, `search.next`, `search.loading`
- Removed internal `load()` function and `getApiResponse` import
- Template iterates `search.visible.values()`
- Has `onNext?: () => Promise<Maybe<string>>` callback prop (returns optional error)
- Button calls `onNext?.()` and captures error
- IntersectionObserver `watch()` calls `onNext()` instead of internal `load()`
- Keeps `auto`, `preload`, `start`, `end` as props (UI concerns)
- Removed `onMount` that set `search.total = count`
- Removed unused `getSearchResults` call (commented out)

### 3. `src/lib/components/layouts/DocumentBrowser.svelte` — DONE (prop wiring)

- Gets `search` from context via `getSearchResults()`
- Selection state reads from context (selectAll, deselectAll, selected, visible, editable, total)
- Passes `search` prop to `<ResultsList {search} auto>`
- Removed `results`, `next`, `count` props from `<ResultsList>` invocation

Still TODO:

- Wire up `search.setResults()` when the `{#await}` block resolves (currently `fixResults` returns a `Promise<DocumentResults>` that isn't fed into the state)
- Integrate `fixResults` logic with the state — either as a transform or by populating the state after `fixResults` runs

### 4. `src/lib/components/addons/DocumentList.svelte` — DONE (prop wiring)

- Gets `searchState` from context via `getSearchResults()`
- Passes `search={searchState}` prop to `<ResultsList search={searchState} auto />`
- Removed `results`, `next`, `count` props from `<ResultsList>` invocation

Still TODO:

- Wire up `searchState.setResults()` when the `{#await}` block resolves
- Pass `onNext={() => searchState.loadNext()}` to `ResultsList`

### 5. `src/routes/(app)/documents/+page.svelte` — DONE

- Creates `SearchResultsState` and sets it in context via `setSearchResults(search)`
- Calls `search.setResults(() => data.searchResults)` to initialize from page data

### 6. Test/demo/story files — DONE

- **`ResultsList.demo.svelte`**: Simplified to a thin test harness. Creates a `SearchResultsState`, seeds it from a `results` prop using `untrack()`, sets up `embed` and `visibleFields` contexts, passes `search` prop to `<ResultsList>`. No longer uses `setSearchResults` or `children` snippet.
- **`ResultsList.test.ts`**: Tests pass `results` to the demo component. Empty state test passes no results (default `[]`). All 4 tests passing.
- **`ResultsList.stories.svelte`**: Creates `SearchResultsState` instances in module script. Each story passes `search` prop directly — "Empty" gets an empty state, others get a populated state. No shared instance script context setup needed. Imported `Demo` component no longer used for stories (stories pass `search` directly to `ResultsList`).

## Key design decisions

1. **`search` is a required prop, not from context** — `ResultsList` receives its `SearchResultsState` as a prop. This makes it explicit, testable, and avoids context coupling. Sidebar components that need the state still use `getSearchResults()` from context.
2. **`onNext` is a callback prop** — ResultsList is presentational; pagination behavior comes via props. This keeps it testable without a real fetch.
3. **`visible` is a SvelteMap, not an array** — Documents are keyed by ID, which gives natural deduplication and O(1) lookup for selection checks. Iteration order is insertion order.
4. **`setResults` accepts a promise-returning getter** — This lets the page route pass `() => data.searchResults` without awaiting it upfront. The class handles the async resolution.
5. **`loadNext` returns an error message** — This lets ResultsList display errors without needing error state in the class (though `loading` state is tracked).
6. **IntersectionObserver stays in ResultsList** — Scroll detection is a UI concern. It just calls the callback.
7. **State created at page level** — The `SearchResultsState` is instantiated in the route (`+page.svelte`), high enough for sidebar siblings (e.g. `DocumentActions`) to access it via context.

## Remaining work

### DocumentBrowser: populate state from `fixResults`

The `fixResults` function in DocumentBrowser transforms raw API results (filtering deleted, patching edited, setting pending status). Currently it returns a `Promise<DocumentResults>` that the `{#await}` block resolves, but those results aren't fed into the `SearchResultsState`. Options:

1. After `fixResults` resolves, populate `search.visible` directly (imperative, in an `$effect` or `{:then}` block)
2. Refactor `fixResults` into a transform that `setResults` applies
3. Have the route's `+page.svelte` handle the initial load and let DocumentBrowser focus on transforms

### DocumentList: populate state from search promise

Similar to DocumentBrowser — the `{#await search}` block resolves a `DocumentResults` that needs to feed into `searchState`.

### `onNext` wiring

Both DocumentBrowser and DocumentList need to pass `onNext={() => search.loadNext()}` to `ResultsList` so the IntersectionObserver and "load more" button actually trigger pagination.

## Verification

1. `npm run test:unit` — all 365 tests pass (44 test files)
2. `npm run check` — 0 errors, 0 warnings
3. `npm run storybook` — ResultsList stories render (each with own state)
4. Manual testing still needed: document search, infinite scroll, "load more" button, select-all, bulk actions, addon document list, embed view
