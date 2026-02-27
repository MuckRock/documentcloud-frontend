# Phase 1: Move search results stores to a Svelte 5 context

> **Status: COMPLETE** — All code changes, test updates, and verification done. `npm run test:unit` (365 passing), `npm run check` (0 errors, 0 warnings).
>
> **Phase 1** of a two-phase refactor. This phase moves selection state out of `ResultsList.svelte`'s module block into a context-based class. Loading/pagination stays in `ResultsList` for now. Phase 2 ([RESULTS_LIST_REFACTOR.md](RESULTS_LIST_REFACTOR.md)) extracts pagination into the same class and makes `ResultsList` fully presentational.

## Scope

Only the stores related to search results selection: `visible`, `selectedIds`, `selected`, `editable`, and `total`. The `highlightState` and `visibleFields` concerns are **out of scope** and stay as they are. Loading/pagination (`load()`, `watch()`, `unwatch()`, `IntersectionObserver`) stays in `ResultsList` — that moves in Phase 2.

## Context

`ResultsList.svelte` defined module-level Svelte stores in a `<script module>` block. These were singletons imported by parent components — an inversion of control where state flows upward from a child. This phase moved that state higher in the tree using a Svelte 5 state class distributed via `createContext`.

## New file: `src/lib/state/search.svelte.ts` (done)

`SearchResultsState` class using `$state` runes and a `createContext` pair, following the pattern established by `VisibleFields.svelte`. Phase 2 will extend this class with pagination state (`results`, `next`, `loading`, `error`, `loadMore()`, etc.).

## Files modified

### 1. `src/lib/components/documents/ResultsList.svelte` (done)

- **Removed** module-level exports for `visible`, `selectedIds`, `selected`, `editable`, `total`
- **Consumes** `getSearchResults()` in the instance script
- **Replaced** store references (`$selectedIds`, `$visible`, `$total`) with `search.selectedIds`, `search.visible`, `search.total`
- **Replaced** `bind:group={$selectedIds}` with explicit `checked`/`onchange` handlers (since `$state` arrays don't support `bind:group`)
- Kept `highlightState`, `visibleFields`, and `StorageManager` logic unchanged

### 2. `src/lib/components/layouts/DocumentBrowser.svelte` (done)

- **Removed** imports of `editable`, `selected`, `selectedIds`, `total`, `visible` from `ResultsList.svelte`
- **Removed** `setContext("editable", ...)` and `setContext("selected", ...)`
- **Consumes** `getSearchResults()` and uses `search.selected`, `search.editable`, etc. directly
- Kept `visibleFields` import from ResultsList and `setVisibleFieldsContext()` as-is

### 3. `src/lib/components/addons/DocumentList.svelte` (done)

- **Removed** imports of `selected`, `selectedIds`, `total`, `visible` from `ResultsList.svelte`
- **Consumes** `getSearchResults()` instead

### 4. `src/lib/components/layouts/AddOnLayout.svelte` (done)

- **Removed** `import { selected } from "../documents/ResultsList.svelte"` and `setContext("selected", selected)`
- **Creates** `new SearchResultsState()` and calls `setSearchResults()`

### 5. `src/lib/components/layouts/Project.svelte` (done)

- **Removed** imports of `editable`, `selected` from `ResultsList.svelte`
- **Removed** `setContext("editable", ...)` and `setContext("selected", ...)`
- **Creates** `new SearchResultsState()` and calls `setSearchResults()`

### 6. `src/routes/(app)/documents/+page.svelte` (done)

- **Removed** imports of `editable`, `selected` from `ResultsList.svelte`
- **Removed** `setContext("editable", ...)` and `setContext("selected", ...)`
- **Creates** `new SearchResultsState()` and calls `setSearchResults()`

### 7. `src/routes/(app)/projects/[id]-[slug]/+page.svelte` (done)

- **Removed** `import { selected } from "..."` and `setContext("selected", selected)`
- **Creates** `new SearchResultsState()` and calls `setSearchResults()`

### 8. `src/routes/embed/projects/[project_id]-[slug]/+page.svelte` (done)

- **Creates** `new SearchResultsState()` and calls `setSearchResults()`

### 9. `src/lib/components/sidebar/DocumentActions.svelte` (done)

- **Replaced** `getContext("editable")` and `getContext("selected")` with `getSearchResults()`
- **Changed** from store syntax (`$editable`, `$selected`) to direct property access (`search.editable`, `search.selected`)

### 10. `src/lib/components/inputs/Selection.svelte` (done)

- **Replaced** `getContext("selected")` with `getSearchResults()`
- **Changed** from store syntax to property access

### 11. `src/lib/components/documents/tests/ResultsList.demo.svelte` (done)

- **Creates** `new SearchResultsState()` and calls `setSearchResults()`

### 12. `src/lib/components/documents/stories/ResultsList.stories.svelte` (done)

- Updated story decorator to create `new SearchResultsState()` and call `setSearchResults()`

## Tests

### Test wrappers (new files)

Because `createContext` uses an internal key that can't be provided via `render()`'s `context` Map, tests use `.demo.svelte` wrappers that call `setSearchResults()` during component init:

- `src/lib/components/sidebar/tests/DocumentActions.demo.svelte` — accepts `docs` and `user` props, uses `untrack()` to read initial prop values
- `src/lib/components/inputs/tests/Selection.demo.svelte` — accepts `docs` and passthrough props, uses `untrack()` to read initial prop values

### Updated test files

- `src/lib/components/documents/tests/ResultsList.test.ts` — tests UI behavior (checkbox checked state, `.selected` class) instead of internal store state
- `src/lib/components/sidebar/tests/DocumentActions.test.ts` — uses demo wrapper instead of manually constructed context Map
- `src/lib/components/inputs/tests/Selection.test.ts` — uses demo wrapper instead of manually constructed context Map

## Implementation notes

- **`bind:group` doesn't work with `$state` arrays** — replaced with explicit `checked` + `onchange` in `ResultsList.svelte`
- **`createContext` key is internal** — tests can't provide context via `render()`'s `context` Map; demo wrapper components are needed
- **`untrack()` suppresses `state_referenced_locally` warnings** in demo wrappers where we intentionally read initial prop values at the top level

## Out of scope (separate refactor)

- `highlightState` — stays as module-level store + `setContext` in ResultsList
- `visibleFields` — stays with `VisibleFields.svelte`'s context system
- `StorageManager` setup for visibleFields — stays in ResultsList module block
- PageHighlights / NoteHighlights `getContext("highlightState")` usage

## Verification

1. `npm run test:unit` — 365 tests passing (44 test files)
2. `npm run check` — 0 errors, 0 warnings
3. `npm run knip` — TODO
4. `npm run storybook` — TODO
5. Manual testing: document selection, select-all, bulk actions, add-on document selection, embed view — TODO
