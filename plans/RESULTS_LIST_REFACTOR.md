# Phase 2: Extract loading/pagination from ResultsList, make it presentational

> **Phase 2** of a two-phase refactor. Builds on Phase 1 ([RESULTS_CONTEXT_REFACTOR.md](RESULTS_CONTEXT_REFACTOR.md)), which moves selection state into a `SearchResultsState` class. This phase extends that class with pagination state and makes `ResultsList` a fully presentational component.
>
> **Prerequisite**: Phase 1 must be completed first. All pre-refactor tests described in that plan should be passing.

## Context

After Phase 1, `ResultsList.svelte` still owns loading/pagination (`load()`, `watch()`, `unwatch()`, `IntersectionObserver`) and receives `results`, `count`, `next` as props. This phase moves pagination state into the `SearchResultsState` class so `ResultsList` becomes stateless — it reads everything from context and delegates loading to an `onLoadMore` callback prop.

## Extend: `src/lib/state/search.svelte.ts`

Extend the `SearchResultsState` class created in Phase 1 with pagination state. The class will combine:

- **Selection**: `visible`, `selectedIds`, `selected` (getter), `editable` (getter), `total`
- **Pagination**: `results`, `next`, `loading`, `error`, `auto`
- **Methods**: `setInitialPage(page)`, `loadMore()`, `selectAll()`, `deselectAll()`
- **Transform**: Optional `PageTransform` callback passed at construction, applied to every page (initial + subsequent). This lets `DocumentBrowser` pass its `fixResults` logic.

Context pair: `[getSearchResults, setSearchResults]` — already created in Phase 1.

## Files to modify (in order)

> Phase 1 already moved selection state to context and updated store references. The changes below are **incremental** — they cover only the pagination extraction, not the selection migration (which is done).

### 1. `src/lib/state/search.svelte.ts`

- Add pagination fields: `results`, `next`, `loading`, `error`, `auto`
- Add methods: `setInitialPage(page)`, `loadMore()`
- Add optional `PageTransform` callback support

### 2. `src/lib/components/documents/ResultsList.svelte`

- **Instance script** (module block already cleaned in Phase 1):
  - Remove `load()`, `watch()`, `unwatch()` functions and the `getApiResponse` import
  - Add `onLoadMore?: () => void` callback prop
  - Keep IntersectionObserver but have it call `onLoadMore()` instead of `load()`
  - Re-observe after loading via `$effect` watching `search.loading` and `search.next`
  - Read `search.results`, `search.next`, `search.loading`, `search.error` instead of local state
  - Remove `results`, `count`, `next` props (read from context instead)
  - Keep `auto`, `preload`, `start`, `end` props
- **Template**: Button calls `onLoadMore?.()`. Checkbox bindings already updated in Phase 1.

### 3. `src/lib/components/layouts/DocumentBrowser.svelte`

> Selection state already reads from context (Phase 1). These changes add pagination wiring.

- Convert `fixResults` into a synchronous `PageTransform` and set it on the state: `search.setTransform(transformFn)` (or pass to `setInitialPage` — TBD based on reactivity needs)
- When the `documents` promise resolves, call `search.setInitialPage(data)`
- Pass `onLoadMore={() => search.loadMore()}` to `ResultsList`

### 4. `src/lib/components/addons/DocumentList.svelte`

> Selection state already reads from context (Phase 1). These changes add pagination wiring.

- When the `search` promise resolves, call `search.setInitialPage(data)`
- Pass `onLoadMore={() => search.loadMore()}` to `ResultsList`

### 5. Test/demo files

- `src/lib/components/documents/tests/ResultsList.demo.svelte`: Initialize state with results/count/next via the `SearchResultsState` API instead of component props
- `src/lib/components/documents/tests/ResultsList.test.ts`: Update tests that relied on `results`/`count`/`next` being passed as props — they now come from context state
- `src/lib/components/documents/stories/ResultsList.stories.svelte`: Same context setup updates

## Key design decisions

1. **`onLoadMore` is a prop, not from context** — ResultsList is presentational; behavior comes via props, state via context. This keeps it testable without a real fetch.
2. **Transform applies to all pages** — Fixes existing gap where `fixResults()` only ran on the initial page. The transform closure reads current reactive values (`$deleted`, `$edited`, etc.) at call time.
3. **IntersectionObserver stays in ResultsList** — Scroll detection is a UI concern. It just calls the callback.
4. **State created at page level, configured in DocumentBrowser** — The `SearchResultsState` is instantiated high enough for sidebar siblings (e.g. `DocumentActions`) to access it. `DocumentBrowser` configures the transform and initializes data.

## Potential issues to watch

- **`bind:group` with `$state` arrays**: Addressed in Phase 1. If it needed a fallback (`checked` + `onchange`), that's already in place.
- **Svelte 4 components** (`AddOnLayout`, `Selection`): Already addressed in Phase 1 — reading `$state` getters in `$:` blocks and templates.
- **Reactive transform closures**: The transform in `DocumentBrowser` closes over `$deleted`, `$edited`, `pending_ids`, `$finished`. When called from `loadMore()`, these should read current values. Verify this.

## Pre-refactor tests

The pre-refactor tests written for Phase 1 (see [RESULTS_CONTEXT_REFACTOR.md](RESULTS_CONTEXT_REFACTOR.md#pre-refactor-tests)) should still pass after Phase 2. Additionally, consider adding:

- **Pagination test for ResultsList**: Verify that clicking "load more" calls `onLoadMore`. Verify that `search.results` growing causes new items to render.
- **IntersectionObserver behavior**: Verify that when `auto` is true and `search.next` is set, the observer triggers `onLoadMore`.

## Verification

1. `npm run test:unit` — all tests pass (including Phase 1 pre-refactor tests)
2. `npm run check` — no TypeScript errors
3. `npm run knip` — no unused exports from old module-level stores
4. `npm run storybook` — ResultsList stories still render
5. Manual: document search, infinite scroll, "load more" button, select-all, bulk actions, addon document list, embed view
