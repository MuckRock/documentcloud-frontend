# Task: Accessibility Audit

## Goal

Analyze the current accessibility state of the SearchEditor and its autocomplete plugin. Document what's working, what's missing, and what needs improvement. **This is an analysis-only task — no code changes.**

## Scope

Audit the following areas against WCAG 2.1 AA guidelines and ARIA authoring practices for combobox/listbox patterns.

### 1. ARIA Attributes on the Autocomplete

**Currently implemented:**
- `aria-autocomplete="list"` on editor DOM
- `aria-expanded="true"/"false"` toggled with dropdown visibility
- `aria-owns="[dropdownId]"` pointing to dropdown container
- `aria-activedescendant="[optionId]"` tracking highlighted option
- `role="listbox"` on dropdown container
- `role="option"` on each suggestion item
- `aria-selected="true"/"false"` on options
- `aria-live="polite"` region announcing suggestion count

**Audit questions:**
- Is the combobox pattern correct per [WAI-ARIA Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)?
- Should the editor have `role="combobox"`? (It's currently a plain `div` with `role="textbox"` from ProseMirror.)
- Is `aria-busy="true"` needed during async loading states?
- Should the dropdown have an `aria-label`?
- Are IDs unique and correctly referenced?

### 2. Keyboard Navigation

**Currently implemented:**
- Arrow Up/Down to navigate suggestions
- Enter/Tab to select a suggestion
- Escape to dismiss autocomplete
- Mod+/ to open full field list
- Mod+Z/Y for undo/redo
- Enter to submit form (when autocomplete closed)

**Audit questions:**
- Can a keyboard-only user complete all workflows (search, select field, select value, edit chip, delete chip)?
- Is focus management correct when the dropdown opens/closes?
- Does Tab behave as expected (move to next focusable element vs. select suggestion)?
- Can chips be deleted with Backspace/Delete when selected?

### 3. Chip Accessibility

**Current state:**
- Chips are `contentEditable="false"` inline atoms.
- ProseMirror handles selection (arrow keys move cursor around chips).
- No `role`, `aria-label`, or `aria-description` on chip elements.

**Audit questions:**
- Should chips have `role="group"` or another landmark role?
- Should chips announce their content to screen readers (e.g., "User: Mitchell Kotler, required")?
- When a chip is selected, is that state announced?
- Can screen reader users understand the structure of a complex query with mixed text and chips?

### 4. Form Integration

**Audit questions:**
- Does the search form have an accessible label?
- Is the submit button properly labeled?
- Is the relationship between the editor and the submit button clear?

### 5. Color and Contrast

**Audit questions:**
- Do operator decorations (AND/OR/NOT backgrounds) meet contrast requirements?
- Do chip colors (blue, purple backgrounds) meet contrast requirements against their text?
- Do prefix indicators (green for +, orange for -) rely solely on color?

## Deliverable

A markdown document (or additions to this file) with:
1. Findings for each section above.
2. Severity rating (critical, major, minor) for each issue found.
3. Recommended fixes (as future work items, not implemented here).

## Files to Audit

- `src/lib/components/documents/search/SearchEditor.svelte`
- `src/lib/components/documents/search/plugins/autocomplete.ts`
- `src/lib/components/documents/search/plugins/autocomplete.css`
- `src/lib/components/documents/search/nodeviews.ts`
- `src/lib/components/documents/search/nodeviews/FieldValueChip.svelte`
- `src/lib/components/documents/search/nodeviews/RangeChip.svelte`
- `src/lib/components/documents/search/nodeviews/SortChip.svelte`
