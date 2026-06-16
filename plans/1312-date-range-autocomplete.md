# Plan: Fix date-range autocomplete for `created_at` / `updated_at` (#1312)

## Problem

Date queries built or loaded in the search editor produce Solr-invalid range
syntax. Solr needs full timestamps in date ranges, e.g.

```
created_at:[2024-01-01T00:00:00Z TO 2024-01-31T23:59:59Z]
```

A bare `created_at:[2024-01-01 TO 2024-01-31]` is rejected, and a single bare
date `created_at:2024-01-15T00:00:00Z` matches only docs created at exactly
midnight UTC.

## Current state (verified on `1312-date-ranges`)

A `formatDateBound()` helper was added during the Svelte 5 migration at
[autocomplete.svelte.ts:404-416](../src/lib/components/documents/search/prosemirror/plugins/autocomplete.svelte.ts#L404-L416).
It is wired into:

- `applyCustomRange` — [autocomplete.svelte.ts:433-434](../src/lib/components/documents/search/prosemirror/plugins/autocomplete.svelte.ts#L433-L434)
- `applyFixedValue` — [autocomplete.svelte.ts:470](../src/lib/components/documents/search/prosemirror/plugins/autocomplete.svelte.ts#L470)

So the **primary calendar → range flow already works** on this branch, and
[SearchEditor.test.ts](../src/lib/components/documents/search/tests/SearchEditor.test.ts)
has passing coverage (e.g. lines 619-620, 658-659 assert the `T00:00:00Z` /
`T23:59:59Z` suffixes).

Two real gaps remain.

### Gap 1 — "Fixed" date input produces a single-second match

`applyFixedValue` runs `formatDateBound(value, "lower")` and builds a
`field-value` atom, so picking the single day `2024-01-15` yields
`created_at:2024-01-15T00:00:00Z` — matching only midnight-UTC docs. The
existing test at
[SearchEditor.test.ts:738-781](../src/lib/components/documents/search/tests/SearchEditor.test.ts#L738-L781)
actually _asserts_ this buggy behavior (`value === "2024-01-15T00:00:00Z"`).

### Gap 2 — Pasted / typed / saved Lucene with bare dates is not reformatted

`handleRangedTerm` stores `term_min` / `term_max` verbatim —
[deserialize.ts:255-262](../src/lib/components/documents/search/utils/deserialize.ts#L255-L262)
— and `serialize` re-emits them verbatim —
[serialize.ts:84-92](../src/lib/components/documents/search/utils/serialize.ts#L84-L92).
So a pasted/typed/saved `created_at:[2024-01-01 TO 2024-01-31]` round-trips
back to Solr unchanged and is rejected. This is the most likely cause of the
original report for anyone editing or reloading a query.

> Note: the GitHub-comment plan cited paths under
> `search/prosemirror/utils/deserialize.ts`; the file actually lives at
> `search/utils/deserialize.ts`. Line numbers below are verified.

## Approach

### 1. Extract a shared `dateBounds` module

Create `src/lib/components/documents/search/utils/dateBounds.ts` exporting
`DATE_FIELDS` and `formatDateBound`, moved out of `autocomplete.svelte.ts`.
Both the autocomplete plugin and `deserialize.ts` import from it so the
formatting rule lives in one place. Keep the existing guard
(`/T|NOW/` skips already-formatted ISO values and `NOW-…` date math; the
`^\d{4}-\d{2}-\d{2}$` check only rewrites bare dates).

### 2. Fix Gap 1 — fixed date becomes a day-spanning range

In `applyFixedValue`, when the field is a date and the value is a bare
`YYYY-MM-DD`, insert a `range` node spanning the whole day
(`[…T00:00:00Z TO …T23:59:59Z]`) instead of a `field-value` atom. Non-date
fixed values (e.g. `page_count:50`) stay `field-value` atoms.

### 3. Fix Gap 2 — normalize bounds on deserialize

In `handleRangedTerm`, when the canonical field is in `DATE_FIELDS`, run
`term_min` / `term_max` through `formatDateBound` before creating the `range`
node. This covers typed, pasted, and saved-search reload paths, and the
existing serialize logic then emits valid Solr.

### 4. Tests (write first, expect them to fail before the fix)

- **`formatDateBound` unit tests** (new, against `dateBounds.ts`): bare lower →
  `T00:00:00Z`; bare upper → `T23:59:59Z`; `*` passes through; empty passes
  through; `NOW-7DAYS` passes through; already-ISO passes through; non-date
  string passes through.
- **Deserialize → serialize roundtrip** (in
  [deserialize.test.ts](../src/lib/components/documents/search/utils/tests/deserialize.test.ts)
  or serialize.test.ts):
  `deserialize("created_at:[2024-01-01 TO 2024-01-31]")` → serialize →
  `created_at:[2024-01-01T00:00:00Z TO 2024-01-31T23:59:59Z]`. Same for
  `updated_at`. `page_count:[10 TO 50]` must stay unchanged.
- **Fixed date → day-range**: rewrite the existing
  [SearchEditor.test.ts:738](../src/lib/components/documents/search/tests/SearchEditor.test.ts#L738)
  test — fill `2024-01-15`, click fixed Insert, expect a `range` node with
  `lower=2024-01-15T00:00:00Z`, `upper=2024-01-15T23:59:59Z`. The
  `page_count` fixed-value regression test already exists at
  [line 783](../src/lib/components/documents/search/tests/SearchEditor.test.ts#L783)
  and should stay green.
- **Half-open calendar range**: fill only start → `lower=…T00:00:00Z, upper=*`;
  mirror for end-only.
- **Pasted query end-to-end**: load `created_at:[2024-01-01 TO 2024-01-31]`
  into the editor, assert the resulting `range` node already carries the time
  suffixes.

### 5. Escape colons in serialized range bounds (the actual fix for the report)

Time suffixes alone are **not enough**. Verified against live Solr on dev:
`created_at:[2024-06-01T00:00:00Z TO 2024-08-01T23:59:59Z]` (unescaped) returns
`200` but the range clause is **silently dropped** — the `:` in `00:00:00` is
read as a Lucene field separator, so it matches every document (the exact
symptom in the report). The bounds must reach Solr with escaped colons:
`created_at:[2024-06-01T00\:00\:00Z TO 2024-08-01T23\:59\:59Z]` → filter applied.

Solr also accepts *quoted* bounds, but the frontend `lucene` parser throws on a
quote inside a range and falls back to plain text, breaking the editor
round-trip — so quoting is not an option. Escaping satisfies both: it
round-trips through the parser and filters correctly in Solr.

Implementation keeps node attrs **clean** (`2024-01-01T00:00:00Z`) so the editor
display (`displayBound` → `toLocaleDateString`) and the parser keep working;
colons are escaped only at the serialize boundary and unescaped on deserialize:

- `escapeRangeBound` / `unescapeRangeBound` in `dateBounds.ts`.
- `serialize` range case wraps each bound in `escapeRangeBound`.
- `deserialize` `handleRangedTerm` runs each bound through `unescapeRangeBound`
  before `formatDateBound`.

## Open questions / notes

- **`T23:59:59Z` vs the issue example.** The issue shows the upper bound as
  midnight (`…2024-01-31T00:00:00Z`), which would _exclude_ docs created during
  Jan 31. The plan's `T23:59:59Z` (inclusive end-of-day) is the more correct
  choice and matches the existing passing tests. Worth calling out explicitly
  since it deviates from the issue text.
- **Quoting — RESOLVED.** See section 5. Quoting breaks the frontend parser;
  escaping colons is the fix. Confirmed end-to-end on dev: an impossible past
  range now returns `count: 0` (was the full corpus before the fix), and the
  reported `created_at` range filters correctly.
- **Out of scope.** The May 20 Sentry `asctime: …` comment is Sentry's own log
  timestamp field, not query content.
- **Still open:** the `/documents/` page loader sends the raw URL `q` straight
  to Solr, so a shared/saved link with bare (or unescaped) dates hits Solr
  with a non-filtering query on first load and only self-corrects once the user
  re-submits through the editor. A complete fix would normalize in the loader
  / query-building layer too.

## Files touched

- `src/lib/components/documents/search/utils/dateBounds.ts` (new)
- `src/lib/components/documents/search/prosemirror/plugins/autocomplete.svelte.ts`
- `src/lib/components/documents/search/utils/deserialize.ts`
- `src/lib/components/documents/search/utils/tests/dateBounds.test.ts` (new)
- `src/lib/components/documents/search/utils/tests/deserialize.test.ts`
- `src/lib/components/documents/search/tests/SearchEditor.test.ts`
