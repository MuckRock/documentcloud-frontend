# Phase 1: Move search results stores to a Svelte 5 context

> **Phase 1** of a two-phase refactor. This phase moves selection state out of `ResultsList.svelte`'s module block into a context-based class. Loading/pagination stays in `ResultsList` for now. Phase 2 ([RESULTS_LIST_REFACTOR.md](RESULTS_LIST_REFACTOR.md)) extracts pagination into the same class and makes `ResultsList` fully presentational.

## Scope

Only the stores related to search results selection: `visible`, `selectedIds`, `selected`, `editable`, and `total`. The `highlightState` and `visibleFields` concerns are **out of scope** and stay as they are. Loading/pagination (`load()`, `watch()`, `unwatch()`, `IntersectionObserver`) stays in `ResultsList` — that moves in Phase 2.

## Context

`ResultsList.svelte` defines module-level Svelte stores in a `<script module>` block. These are singletons imported by parent components — an inversion of control where state flows upward from a child. The goal is to move this state higher in the tree using a Svelte 5 state class distributed via `createContext`.

## New file: `src/lib/state/search.svelte.ts`

Create a `SearchResultsState` class using `$state` runes and a `createContext` pair, following the pattern established by `VisibleFields.svelte`. Phase 2 will extend this class with pagination state (`results`, `next`, `loading`, `error`, `loadMore()`, etc.).

```typescript
import type { Document } from "$lib/api/types";
import { createContext } from "svelte";

export class SearchResultsState {
  visible: Map<string, Document> = $state(new Map());
  selectedIds: string[] = $state([]);
  total: number = $state(0);

  get selected(): Document[] {
    return this.selectedIds
      .map((id) => this.visible.get(id))
      .filter(Boolean) as Document[];
  }

  get editable(): boolean {
    return (
      this.selected.length > 0 && this.selected.every((d) => d.edit_access)
    );
  }

  selectAll() {
    this.selectedIds = [...this.visible.keys()];
  }

  deselectAll() {
    this.selectedIds = [];
  }
}

export const [getSearchResults, setSearchResults] =
  createContext<SearchResultsState>();
```

## Files to modify

### 1. `src/lib/components/documents/ResultsList.svelte`

- **Remove** module-level exports for `visible`, `selectedIds`, `selected`, `editable`, `total` (keep `highlightState` and `visibleFields` as-is for now)
- **Consume** `getSearchResults()` in the instance script
- **Replace** store references (`$selectedIds`, `$visible`, `$total`) with `search.selectedIds`, `search.visible`, `search.total`
- Keep `highlightState`, `visibleFields`, and `StorageManager` logic unchanged

### 2. `src/lib/components/layouts/DocumentBrowser.svelte`

- **Remove** imports of `editable`, `selected`, `selectedIds`, `total`, `visible` from `ResultsList.svelte`
- **Remove** `setContext("editable", ...)` and `setContext("selected", ...)`
- **Consume** `getSearchResults()` and use `search.selected`, `search.editable`, etc. directly
- Keep `visibleFields` import from ResultsList and `setVisibleFieldsContext()` as-is

### 3. `src/lib/components/addons/DocumentList.svelte`

- **Remove** imports of `selected`, `selectedIds`, `total`, `visible` from `ResultsList.svelte`
- **Consume** `getSearchResults()` instead

### 4. `src/lib/components/layouts/AddOnLayout.svelte`

- **Remove** `import { selected } from "../documents/ResultsList.svelte"`
- **Remove** `setContext("selected", selected)`
- **Create** `new SearchResultsState()` and call `setSearchResults()`

### 5. `src/lib/components/layouts/Project.svelte`

- **Remove** imports of `editable`, `selected` from `ResultsList.svelte`
- **Remove** `setContext("editable", ...)` and `setContext("selected", ...)`
- **Create** `new SearchResultsState()` and call `setSearchResults()`

### 6. `src/routes/(app)/documents/+page.svelte`

- **Remove** imports of `editable`, `selected` from `ResultsList.svelte`
- **Remove** `setContext("editable", ...)` and `setContext("selected", ...)`
- **Create** `new SearchResultsState()` and call `setSearchResults()`

### 7. `src/routes/(app)/projects/[id]-[slug]/+page.svelte`

- **Remove** `import { selected } from "..."` and `setContext("selected", selected)`
- **Create** `new SearchResultsState()` and call `setSearchResults()`

### 8. `src/routes/embed/projects/[project_id]-[slug]/+page.svelte`

- **Create** `new SearchResultsState()` and call `setSearchResults()`

### 9. `src/lib/components/sidebar/DocumentActions.svelte`

- **Replace** `getContext("editable")` and `getContext("selected")` with `getSearchResults()`
- **Change** from store syntax (`$editable`, `$selected`) to direct property access (`search.editable`, `search.selected`)

### 10. `src/lib/components/inputs/Selection.svelte`

- **Replace** `getContext("selected")` with `getSearchResults()`
- **Change** from store syntax to property access

### 11. `src/lib/components/documents/tests/ResultsList.demo.svelte`

- **Create** `new SearchResultsState()` and call `setSearchResults()`

### 12. `src/lib/components/documents/stories/ResultsList.stories.svelte`

- Update story decorator to create `new SearchResultsState()` and call `setSearchResults()`

## Pre-refactor tests

Before touching any production code, add tests that pin the current behavior of the stores and the components that consume them. These tests serve as a safety net: if they pass before and after the refactor, we know the migration preserved behavior.

### Current coverage

Only one test file exists: `src/lib/components/documents/tests/ResultsList.test.ts` (89 lines). It covers:
- Rendering results and headings
- "No search results" fallback
- Populating `$selectedIds` via checkbox clicks
- Building `$selected` from `$selectedIds` and `$visible`

**Not tested at all:** `editable`, `total`, `visible` (as a Map), select-all / deselect-all, `DocumentActions`, `Selection`.

### Tests to add

#### 1. `src/lib/components/documents/tests/ResultsList.test.ts` — expand existing

- **`editable` store**: Import `editable` alongside `selected`/`selectedIds`. After selecting documents, verify `get(editable)` is `false` when fixture documents have `edit_access: false`. Then mutate a fixture document to have `edit_access: true`, re-select, and verify `editable` becomes `true`. (The search-highlight fixture has a mix of `edit_access` values, so we can select a subset.)
- **`total` store**: Import `total`. After rendering with `count`, verify `get(total)` equals the count passed to the component.
- **`visible` store**: Import `visible`. After rendering, verify `get(visible)` is a Map whose keys are string document IDs and values are the fixture documents.
- **select-all / deselect-all**: Click the select-all checkbox (check all boxes), verify `$selectedIds` matches all visible keys. Then uncheck all, verify it's empty.
- **partial selection**: Select a subset of checkboxes and verify `$selected` returns only the matching documents.

#### 2. `src/lib/components/sidebar/tests/DocumentActions.test.ts` — new file

`DocumentActions.svelte` reads `getContext("editable")` and `getContext("selected")` to enable/disable bulk-action buttons. Use `ContextDecorator.svelte` to set these contexts in the test.

Tests:
- **All buttons disabled when no documents selected**: Pass `selected = writable([])` and `editable = writable(false)`. Verify the Edit, Data, Reprocess, Delete buttons are disabled.
- **Share enabled only for single selection**: Pass one document in `selected`. Verify Share button is enabled. Pass two documents, verify Share is disabled.
- **Edit/Data/Reprocess/Delete enabled when editable**: Pass `editable = writable(true)` with documents selected. Verify those buttons are enabled.
- **Change Owner button**: Depends on `canChangeOwner` — test that it's disabled when user doesn't own the documents.

#### 3. `src/lib/components/inputs/tests/Selection.test.ts` — new file

`Selection.svelte` reads `getContext("selected")` to show selected document count and build the `value` output.

Tests:
- **Renders radio options for "query" and "selected"**: Pass `documents = new Set(["query", "selected"])` with a `selected` store holding 3 documents. Verify both radio labels render with correct counts.
- **Outputs correct value for "selected" choice**: Click the "selected" radio, verify `value` contains `{ documents: [id1, id2, id3] }`.
- **Outputs correct value for "query" choice**: Click the "query" radio, verify `value` contains `{ query: "..." }`.

### Test infrastructure

Use the existing `src/lib/components/storybook/ContextDecorator.svelte` to provide context in tests. It accepts arbitrary props and calls `setContext` for each one, then renders its children. No new `.demo.svelte` wrappers are needed for DocumentActions or Selection — just render `ContextDecorator` with the component nested inside it.

### Running pre-refactor tests

After writing all tests, run them against the **current code** before starting any refactor work:

```bash
npm run test:unit
npm run check
```

All tests must pass. Then, during the refactor, these same tests will be updated to use the new `SearchResultsState` context instead of module-level stores and `setContext` wrappers.

## Out of scope (separate refactor)

- `highlightState` — stays as module-level store + `setContext` in ResultsList
- `visibleFields` — stays with `VisibleFields.svelte`'s context system
- `StorageManager` setup for visibleFields — stays in ResultsList module block
- PageHighlights / NoteHighlights `getContext("highlightState")` usage

## Verification

1. `npm run test:unit` — all existing and new tests pass
2. `npm run check` — no TypeScript errors
3. `npm run knip` — no unused exports from the old module-level stores
4. `npm run storybook` — ResultsList stories still render
5. Manual testing: document selection, select-all, bulk actions, add-on document selection, embed view
