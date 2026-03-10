# Feat: Range Autocompletion

## Goal

Add a generic range autocompletion flow that activates when the user selects a rangeable field (`created_at`, `updated_at`, `page_count`) from autocomplete. The flow collects a start value, end value, and offers shortcuts — then inserts a `range` node (chip) into the editor.

## Current State

- Range nodes exist in the schema (`range` atom node with `field`, `lower`, `upper`, `inclusiveLower`, `inclusiveUpper`, `prefix` attrs).
- Ranges are deserialized from Lucene strings (e.g., `created_at:[NOW-1MONTH TO *]` becomes a range chip).
- Range chips render via `RangeChip.svelte`.
- Date/numeric fields are currently defined with `insertBehavior: "text"` and `hasValueSuggestions: false`, so autocomplete inserts `created_at:` as plain text with no further guidance.

## Design

### New `insertBehavior`: `"range-chip"`

Change `created_at`, `updated_at`, and `page_count` to use a new insert behavior. When the user selects one of these fields from autocomplete, instead of inserting text or transitioning to a simple value picker, the plugin enters a **range stage**.

### Range Stage UI

The autocomplete dropdown transforms into a range builder with three sections:

1. **Shortcuts** (top) — pre-built ranges for common queries. Selecting a shortcut inserts the range node immediately.
2. **Start value** — labeled input for the lower bound.
3. **End value** — labeled input for the upper bound.
4. **Insert button** — creates the range node from the entered values.

### Per-Field Configuration

Each rangeable field defines its own labels and shortcuts in `autocomplete-data.ts`:

```
created_at / updated_at:
  - Start label: "Start Date"
  - End label: "End Date"
  - Shortcuts:
    - "Last week"       → [NOW-7DAYS TO *]
    - "Last month"      → [NOW-1MONTH TO *]
    - "Last 3 months"   → [NOW-3MONTHS TO *]
    - "Last year"       → [NOW-1YEAR TO *]
    - "Today"           → [NOW/DAY TO *]

page_count:
  - Start label: "Min. Pages"
  - End label: "Max. Pages"
  - Shortcuts:
    - "1-10 pages"      → [1 TO 10]
    - "10-50 pages"     → [10 TO 50]
    - "50-100 pages"    → [50 TO 100]
    - "100+ pages"      → [100 TO *]
```

### Data Model

Add a `RangeFieldConfig` type to `autocomplete-data.ts`:

```ts
interface RangeFieldConfig {
  startLabel: string;
  endLabel: string;
  shortcuts: Array<{
    label: string;
    lower: string;
    upper: string;
    inclusiveLower?: boolean;  // default true
    inclusiveUpper?: boolean;  // default true
  }>;
}
```

Add a `RANGE_CONFIGS` map keyed by field name, and a `getRangeConfig(fieldName)` accessor.

### Autocomplete Plugin Changes

1. Add a `"range"` stage to `AutocompleteState` (alongside `"field"` and `"value"`).
2. When a field with `insertBehavior: "range-chip"` is selected, transition to the range stage.
3. In the range stage, render the range builder UI in the dropdown.
4. Shortcut selection inserts a `range` node immediately (same pattern as `applyValueSuggestion`).
5. Custom start/end values create a `range` node with the entered bounds.
6. Arrow keys navigate shortcuts; Tab/Enter selects.

### Dropdown Rendering

The range builder replaces the standard suggestion list in the dropdown. Rough structure:

```
┌─────────────────────────┐
│ Last week               │  ← shortcuts (navigable)
│ Last month              │
│ Last year               │
│ Today                   │
├─────────────────────────┤
│ Start Date: [_________] │  ← input fields
│ End Date:   [_________] │
│            [Insert]     │
└─────────────────────────┘
```

Keyboard flow: arrow keys move through shortcuts. Tab moves to the input fields. Enter on a shortcut inserts it; Enter in the inputs (or clicking Insert) builds the range from the entered values.

We should use the built-in browser datepicker for the State Date and End Date fields; this is provided on the `date` type input. See more in MDN docs:
https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date

## Files to Modify

| File | Change |
|------|--------|
| `autocomplete-data.ts` | Add `RangeFieldConfig`, `RANGE_CONFIGS`, `getRangeConfig()`. Change `created_at`, `updated_at`, `page_count` to `insertBehavior: "range-chip"`. |
| `plugins/autocomplete.ts` | Add `"range"` stage to state. Handle range field selection → range stage transition. Render range builder UI. Handle shortcut selection and custom range insertion. |
| `plugins/autocomplete.css` | Styles for range builder (inputs, shortcut list, separator). |
| `tests/autocomplete.test.ts` | Tests for `getRangeConfig`, range shortcuts data. |
| `tests/SearchEditor.test.ts` | Integration tests: select `created_at` → shortcuts appear → select shortcut → range chip inserted. |
| `stories/SearchEditor.stories.svelte` | Story with range autocomplete interaction. |

## Out of Scope

- Calendar date picker UI (use text input with date math syntax for now).
- Validation of date math expressions.
- Custom inclusive/exclusive bracket selection in the UI (defaults to inclusive `[]`).
