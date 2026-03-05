# Phase 2: Extract loading/pagination from ResultsList, make it presentational

> **Phase 2** of a two-phase refactor. Builds on Phase 1 ([RESULTS_CONTEXT_REFACTOR.md](RESULTS_CONTEXT_REFACTOR.md)), which moves selection state into a `SearchResultsState` class. This phase extends that class with pagination state and makes `ResultsList` a fully presentational component.
>
> **Prerequisite**: Phase 1 must be completed first. All pre-refactor tests described in that plan should be passing.

## Context

After Phase 1, `ResultsList.svelte` still owns loading/pagination (`load()`, `watch()`, `unwatch()`, `IntersectionObserver`) and receives `results`, `count`, `next` as props. This phase moves pagination state into the `SearchResultsState` class so `ResultsList` becomes stateless — it reads everything from context and delegates loading to an `onNext` callback prop.

## Current state: `src/lib/state/search.svelte.ts`

The `SearchResultsState` class now combines:

- **Selection**: `visible` (SvelteMap), `selectedIds` (SvelteSet), `selected` (getter), `editable` (getter), `total`
- **Pagination**: `next`, `loading`, `query`, `options`
- **Methods**: `load(query, options?, fetch?)`, `setResults(getter)`, `loadNext()`, `selectAll()`, `deselectAll()`

> Note: results live in the `visible` SvelteMap (keyed by document ID), not a separate `results` array. The original plan's `setInitialPage` is now `setResults`, and `loadMore` is now `loadNext`. There is no separate `PageTransform` — the class handles document indexing internally.

Context pair: `[getSearchResults, setSearchResults]` — created in Phase 1.

## Progress

### 1. `src/lib/state/search.svelte.ts` — DONE

- Added pagination fields: `next`, `loading`, `query`, `options`
- Added `load(query, options?, fetch?)` — loads initial results via API, clears previous
- Added `setResults(getter)` — accepts a promise-returning function, populates `visible` map, sets `total` and `next`
- Added `loadNext()` — fetches next page URL, appends to `visible` map, returns error message on failure
- No `PageTransform` callback — document indexing into the `visible` map handles deduplication naturally

### 2. `src/lib/components/documents/ResultsList.svelte` — IN PROGRESS

What's done:

- Gets `search` from context via `getSearchResults()`
- Selection uses `search.selectedIds` (checked + onchange pattern from Phase 1)
- Has `onNext?: () => Promise<Maybe<string>>` callback prop (returns optional error)
- Button calls `onNext?.()` and captures error
- IntersectionObserver `watch()` calls `onNext()` instead of internal `load()`

What still needs to happen:

- Remove the internal `load()` function and `getApiResponse` import (currently unused dead code, but still present)
- Remove `results`, `count`, `next` props — read from `search.visible`, `search.total`, `search.next` instead
- Template should iterate `[...search.visible.values()]` instead of `results` prop
- Read `search.loading` and `search.next` instead of local `loading`/`next` state
- The `onMount` that sets `search.total = count` can be removed once count comes from context
- Remove `auto` as a prop if it moves to state (TBD — may keep as prop since it's a UI concern)

### 3. `src/lib/components/layouts/DocumentBrowser.svelte` — IN PROGRESS

What's done:

- Imports `getSearchResults` and reads search state from context
- Selection state reads from context (selectAll, deselectAll, selected, visible, editable, total)

What still needs to happen:

- When the `documents` promise resolves in the `{#await}` block, call `search.setResults()` instead of passing props to `ResultsList`
- Pass `onNext={() => search.loadNext()}` to `ResultsList`
- Remove `results`, `next`, `count` props from `<ResultsList>` invocation
- Integrate `fixResults` logic — either as a transform on `setResults`/`loadNext`, or by calling it separately after data loads

### 4. `src/lib/components/addons/DocumentList.svelte` — NOT STARTED

- When the `search` promise resolves, call `search.setResults()` instead of passing props
- Pass `onNext={() => search.loadNext()}` to `ResultsList`
- Remove `results`, `next`, `count` props from `<ResultsList>` invocation

### 5. `src/routes/(app)/documents/+page.svelte` — DONE

- Creates `SearchResultsState` and sets it in context via `setSearchResults(search)`
- Calls `search.setResults(() => data.searchResults)` to initialize from page data

### 6. Test/demo files — NOT STARTED

- `src/lib/components/documents/tests/ResultsList.demo.svelte`: Initialize state with results/count/next via the `SearchResultsState` API instead of component props
- `src/lib/components/documents/tests/ResultsList.test.ts`: Update tests that relied on `results`/`count`/`next` being passed as props — they now come from context state
- `src/lib/components/documents/stories/ResultsList.stories.svelte`: Same context setup updates

## Key design decisions

1. **`onNext` is a prop, not from context** — ResultsList is presentational; behavior comes via props, state via context. This keeps it testable without a real fetch. Named `onNext` (not `onLoadMore`) to match the `next` cursor concept.
2. **`visible` is a SvelteMap, not an array** — Documents are keyed by ID, which gives natural deduplication and O(1) lookup for selection checks. Iteration order is insertion order.
3. **`setResults` accepts a promise-returning getter** — This lets the page route pass `() => data.searchResults` without awaiting it upfront. The class handles the async resolution.
4. **`loadNext` returns an error message** — This lets ResultsList display errors without needing error state in the class (though `loading` state is tracked).
5. **IntersectionObserver stays in ResultsList** — Scroll detection is a UI concern. It just calls the callback.
6. **State created at page level** — The `SearchResultsState` is instantiated in the route (`+page.svelte`), high enough for sidebar siblings (e.g. `DocumentActions`) to access it. `DocumentBrowser` and `DocumentList` configure data loading.

## Potential issues to watch

- **`bind:group` with `$state` arrays**: Addressed in Phase 1. Uses `checked` + `onchange` pattern.
- **Svelte 4 components** (`AddOnLayout`, `Selection`): Already addressed in Phase 1 — reading `$state` getters in `$:` blocks and templates.
- **Reactive closures in DocumentBrowser**: The `fixResults` transform closes over `$deleted`, `$edited`, `pending_ids`, `$finished`. Need to decide how this integrates — either pass to `setResults`/`loadNext` or apply after.
- **`visible` map iteration vs array**: Components that expect `Document[]` will need `[...search.visible.values()]`. Verify this works in `{#each}` blocks.

## Pre-refactor tests

The pre-refactor tests written for Phase 1 (see [RESULTS_CONTEXT_REFACTOR.md](RESULTS_CONTEXT_REFACTOR.md#pre-refactor-tests)) should still pass after Phase 2. Additionally, consider adding:

- **Pagination test for ResultsList**: Verify that clicking "load more" calls `onNext`. Verify that new items in `search.visible` cause new items to render.
- **IntersectionObserver behavior**: Verify that when `auto` is true and `search.next` is set, the observer triggers `onNext`.

## Verification

1. `npm run test:unit` — all tests pass (including Phase 1 pre-refactor tests)
2. `npm run check` — no TypeScript errors
3. `npm run knip` — no unused exports from old module-level stores
4. `npm run storybook` — ResultsList stories still render
5. Manual: document search, infinite scroll, "load more" button, select-all, bulk actions, addon document list, embed view
