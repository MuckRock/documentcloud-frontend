# Reduce reactive churn in ProcessContext polling

> **Independent** of the search results refactor ([Phase 1](RESULTS_CONTEXT_REFACTOR.md) / [Phase 2](RESULTS_LIST_REFACTOR.md)), but complementary. Can be done before, after, or in parallel.
>
> **How they connect**: ProcessContext's `documents` and `finished` stores feed into `DocumentBrowser.svelte`'s `$derived` expressions (`pending_ids`, `searchResults` via `fixResults`). Unnecessary store notifications here cause DocumentBrowser to recompute search results and re-render ResultsList even when nothing changed. The search results refactor fixes the _propagation path_; this refactor fixes the _source_ of churn. Both together eliminate the full cascade.
>
> After Phase 2, `fixResults` becomes a `PageTransform` closure on `SearchResultsState`. Fingerprinting here prevents that transform from re-running needlessly.

## Problem

`ProcessContext.svelte` polls for pending documents and running add-ons every 5 seconds. The current implementation uses a single `$effect` that both drives polling AND detects finished documents. This creates a self-sustaining reactive feedback loop:

1. The `$effect` reads `$documents`, `$addons`, `$currentIds`, `$finished`, and `started`
2. It calls `load()`, which triggers `_load()`
3. `_load()` unconditionally writes to those same stores (`documents.set()`, `addons.set()`, `finished.update()`)
4. Svelte stores always notify subscribers for object/array values (via `safe_not_equal`), even when the data hasn't changed
5. Store notifications re-trigger the `$effect` → back to step 1

This means every 5-second poll cycle triggers cascading reactive updates through the entire app tree — DocumentBrowser recomputes search results, ProcessDropdown recomputes counts, Documents.svelte re-evaluates its effect — even when nothing has changed.

### Additional waste

- `started = new Set([...started, ...docs.map(d => d.doc_id)])` runs on every `documents` store notification via a subscription, always creating a new Set reference
- `finished.update(f => { inProgress.forEach(d => f.delete(d.doc_id)); return f })` returns the same Set reference after a no-op mutation, but still triggers notification
- The `currentIds` derived store recomputes on every `documents` notification

## Why stores instead of `$state`?

Module-level `$state` doesn't cross Svelte context boundaries reactively. All 6 ProcessContext consumers use `$store` auto-subscription syntax via context getters (`getPendingDocuments()`, `getRunningAddons()`, etc.). The codebase has zero examples of module-level `$state`. Keeping writable stores preserves the existing consumer API with no changes needed downstream.

## Plan

All changes are in `src/lib/components/processing/ProcessContext.svelte`.

### 1. Track state in plain module-level variables

Since `_load` is the single writer for all process state, we use plain module-level variables as the source of truth. Stores become pure notification channels for consumers — only updated when data genuinely changes. This avoids needing `get()` from `svelte/store`.

```ts
// Module-level state (not reactive, not stores)
let _previousIds: Set<number> = new Set();
let _finishedIds: Set<number> = new Set();
let _hasActiveWork = false;
let _loading = false;
let _docsFP = "";
let _addonsFP = "";
```

### 2. Decouple polling from reactivity

Replace the `$effect` that drives polling with a `setInterval` in `onMount`. The interval checks the plain `_hasActiveWork` flag (set by `_load` on each cycle) instead of reading stores. This breaks the reactive feedback loop entirely.

```ts
onMount(() => {
  load();
  const interval = setInterval(() => {
    if (_hasActiveWork) load();
  }, POLL_INTERVAL);
  return () => clearInterval(interval);
});
```

### 3. Move finished-document detection into `_load`

Instead of tracking finished documents reactively (with `started`, `currentIds`, and the `$effect`), detect them imperatively inside `_load` by comparing `_previousIds` with the current fetch result.

Finished set management uses `_finishedIds` as source of truth:

- **Newly finished docs**: IDs in `_previousIds` but not in current → add to `_finishedIds`, call `finished.set(new Set(_finishedIds))`, call `invalidate()` for each
- **Reprocessing cleanup**: IDs in current that are also in `_finishedIds` → remove from `_finishedIds`, call `finished.set(new Set(_finishedIds))`
- Store is only touched when `_finishedIds` actually changes

This eliminates:

- The `started` instance variable and its subscription
- The `currentIds` derived store
- The `$effect` entirely

### 4. Skip unchanged store writes with fingerprinting

Before calling `documents.set()` or `addons.set()`, compare a string fingerprint of the new data with the previous fingerprint. Only update the store when data genuinely changed.

```ts
// Pending docs: compare doc_id + progress fields
inProgress
  .map(
    (d) => `${d.doc_id}:${d.images}:${d.texts}:${d.text_positions}:${d.pages}`,
  )
  .sort()
  .join("|");

// Add-ons: compare uuid + status + progress + dismissed
results
  .map((r) => `${r.uuid}:${r.status}:${r.progress}:${r.dismissed}`)
  .sort()
  .join("|");
```

### 5. Guard against concurrent `_load` calls

The `_loading` flag causes `_load` to return early if already in flight. The `throttle` wrapper doesn't await promises, so overlapping `_load` executions are possible when external callers (Upload, Reprocess) trigger `load()` near the interval tick.

### What gets removed from the instance script

- `started: Set<number>` and its `documents.subscribe()` callback
- `currentIds` derived store
- The `$effect` (both polling and invalidation detection)

### What stays

- `setContext` (unchanged — stores passed through context)
- `onMount` (simplified to initial `load()` + `setInterval`)
- `onDestroy` (cancels throttle)
- Props and template

## Outcome

- **No reactive feedback loop**: polling is timer-driven
- **No unnecessary store notifications**: fingerprint comparison prevents no-op `set()` calls
- **No cascading re-renders**: downstream consumers only react when data genuinely changes
- **Simpler component**: ~10 lines of instance script instead of ~25
- **External callers unaffected**: `load` remains a throttled module export

## Verification

1. `npm run test:unit` — no test regressions (including pre-refactor tests from [Phase 1](RESULTS_CONTEXT_REFACTOR.md#pre-refactor-tests) if those exist yet)
2. `npm run check` — no type errors
3. Manual: upload a document, verify processing progress updates in sidebar
4. Manual: verify that when a document finishes processing, its viewer page refreshes
5. Manual: verify polling stops when nothing is processing or running
6. If done after Phase 2: verify that `PageTransform` in DocumentBrowser doesn't re-run when ProcessContext polls with no changes
