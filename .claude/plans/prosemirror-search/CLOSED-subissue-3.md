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

## Files Audited

- `src/lib/components/documents/search/SearchEditor.svelte`
- `src/lib/components/documents/search/prosemirror/plugins/autocomplete.svelte.ts`
- `src/lib/components/documents/search/AutocompleteDropdown.svelte`
- `src/lib/components/documents/search/RangeBuilder.svelte`
- `src/lib/components/documents/search/ChipEditor.svelte`
- `src/lib/components/documents/search/prosemirror/nodeviews.svelte.ts`
- `src/lib/components/documents/search/FieldValueChip.svelte`
- `src/lib/components/documents/search/RangeChip.svelte`
- `src/lib/components/documents/search/SortChip.svelte`

---

## Audit Findings

### What's Working Well

The autocomplete plugin has solid ARIA foundations:

- `aria-autocomplete="list"`, `aria-expanded`, `aria-activedescendant` are properly managed on the editor DOM
- `role="listbox"` on dropdown container, `role="option"` on each suggestion item, `aria-selected` tracking the highlighted item
- `aria-live="polite"` region with `aria-atomic="true"` announcing suggestion counts
- Full keyboard navigation: ArrowUp/Down to navigate suggestions, Enter/Tab to select, Escape to dismiss, Mod+/ to open field list
- ChipEditor dialog has `role="dialog"`, `aria-label="Edit chip"`, and `aria-pressed` on toggle buttons
- Undo/redo with Mod+Z/Y works through standard ProseMirror history

---

### 1. ARIA Attributes on the Autocomplete

#### Finding 1.1 — Editor textbox has no accessible name (Critical)

`SearchEditor.svelte` ~line 139: The editor `<div>` has `role="textbox"` but no `aria-label` or `aria-labelledby`. Screen readers announce it as an unlabeled text input.

**Recommended fix:** Add `aria-label="Search documents"` to the editor container div.

#### Finding 1.2 — `aria-owns` should be `aria-controls` (Minor)

`autocomplete.svelte.ts` ~line 717: Uses `aria-owns` to associate the editor with the dropdown. The WAI-ARIA combobox pattern specifies `aria-controls` for this relationship. `aria-owns` changes the accessibility tree parent-child relationship, which is not the intended semantic here.

**Recommended fix:** Change `aria-owns` to `aria-controls`.

#### Finding 1.3 — Dropdown listbox has no `aria-label` (Minor)

`AutocompleteDropdown.svelte` ~line 45: The `role="listbox"` container has an `id` but no `aria-label`. Adding one (e.g., "Search field suggestions" or "Value suggestions") helps screen reader users orient themselves.

**Recommended fix:** Add a context-aware `aria-label` to the listbox element.

#### Finding 1.4 — Autocomplete options lack concatenated `aria-label` (Major)

`AutocompleteDropdown.svelte` ~lines 52-67: Each option renders `label` and `description` as separate spans. While screen readers will read the text content, a concatenated `aria-label` (e.g., "user — Filter by document uploader") would provide a more reliable, atomic announcement.

**Recommended fix:** Add `aria-label="{label}{description ? ', ' + description : ''}"` to each option.

#### Finding 1.5 — No live region announcement for stage transitions (Major)

`autocomplete.svelte.ts` ~line 860: The `announceCount` function announces suggestion counts but doesn't indicate which stage the user is in. When transitioning from field selection to value selection, screen reader users have no announcement that the context changed.

**Recommended fix:** Enhance announcements to include stage context (e.g., "3 values for user field available" vs "15 field suggestions available"). Add an announcement when entering a new stage.

#### Finding 1.6 — No `aria-busy` during async loading (Minor)

When API-backed suggestions are loading, no `aria-busy="true"` is set on the listbox. The loading indicator is visual only.

**Recommended fix:** Set `aria-busy="true"` on the listbox during loading, and announce "Loading suggestions" via the live region.

---

### 2. Keyboard Navigation

#### Finding 2.1 — Keyboard workflows are complete (No issue)

A keyboard-only user can: type to search, navigate suggestions with arrows, select with Enter/Tab, dismiss with Escape, open the full field list with Mod+/, undo/redo, and submit the form with Enter (when autocomplete is closed). Chips can be selected and deleted with Backspace/Delete via ProseMirror's NodeSelection.

#### Finding 2.2 — ChipEditor dialog has no focus trap (Major)

`ChipEditor.svelte` ~lines 128-135: The dialog has `role="dialog"` and handles Escape to close, but Tab can escape the dialog to other page elements. Per WAI-ARIA dialog pattern, focus should be trapped within the dialog while it's open.

**Recommended fix:** Implement focus trapping (Tab/Shift+Tab cycle within dialog elements). Consider using a focus-trap library or manual implementation with `querySelectorAll('[tabindex], button, input')`.

#### Finding 2.3 — RangeBuilder keyboard navigation is incomplete (Major)

`RangeBuilder.svelte`: ArrowDown doesn't move focus between the fixed-value shortcuts and the custom range inputs. Enter only works inside inputs for submission, not for selecting shortcut options from the list. The component mixes `role="listbox"` (for shortcuts) with form inputs, creating a confusing keyboard model.

**Recommended fix:** Separate the shortcuts (listbox with arrow navigation) from the custom range form (standard Tab navigation), or switch to `role="dialog"` with clear Tab-order sections.

---

### 3. Chip Accessibility

#### Finding 3.1 — Chips have no `role` or `aria-label` (Critical)

All three chip components (`FieldValueChip.svelte`, `RangeChip.svelte`, `SortChip.svelte`) render as plain `<span class="search-chip">` with no semantic role. The NodeView wrapper span in `nodeviews.svelte.ts` ~line 47 also lacks ARIA attributes. Screen readers will read the raw text content but won't identify them as interactive elements or structured query parts.

**Recommended fix:** Add `aria-label` to each chip with a descriptive announcement:
- FieldValueChip: "User: Mitchell Kotler, required" (including prefix meaning)
- RangeChip: "Created at: from 1 month ago to now, inclusive"
- SortChip: "Sort by page count, ascending"

#### Finding 3.2 — Chips are not independently keyboard-focusable (Major)

`nodeviews.svelte.ts` ~line 47: The chip wrapper span has `contentEditable="false"` but no `tabindex`. ProseMirror's own selection mechanism (NodeSelection via arrow keys) handles chip selection, which partially mitigates this. However, chips cannot receive focus independently for screen reader exploration.

**Recommended fix:** Consider adding `tabindex="-1"` (programmatically focusable but not in Tab order, since ProseMirror manages selection) and ensuring ProseMirror's NodeSelection triggers an accessible announcement.

#### Finding 3.3 — Chip selection state is not announced (Major)

When a chip is selected (blue highlight via ProseMirror NodeSelection), there is no screen reader announcement. Users navigating with arrow keys through a mixed text-and-chip query won't know when they've landed on a chip vs. text.

**Recommended fix:** Add an `aria-live` announcement when a chip becomes selected, e.g., "Selected: User: Mitchell Kotler chip. Press Backspace to delete or Enter to edit."

---

### 4. Form Integration

#### Finding 4.1 — No `aria-invalid` when query is invalid (Major)

`SearchEditor.svelte` ~line 56: The `queryValid` state drives a visual indicator (red icon, wavy underline) but the `role="textbox"` div never receives `aria-invalid="true"`. Screen readers don't know the query has a syntax error.

**Recommended fix:** Bind `aria-invalid={!queryValid}` on the editor div. Add an `aria-describedby` pointing to an error message element (visually hidden or visible) explaining the issue.

#### Finding 4.2 — Form has no accessible label (Minor)

The search form wrapping the editor has no `<label>`, `aria-label`, or `aria-labelledby`. The submit button is an icon-only button. While the placeholder text says "Search documents", it's implemented as a CSS pseudo-element and not accessible.

**Recommended fix:** Add `aria-label="Search documents"` to the form element, and `aria-label="Search"` to the submit button.

---

### 5. Color and Contrast

#### Finding 5.1 — Prefix decorations use color only (Critical)

`SearchEditor.svelte` ~lines 206-213: The `.search-prefix-required` (green) and `.search-prefix-excluded` (orange) classes apply color only to `+`/`-` characters in inline text. The characters themselves (`+`/`-`) do provide a non-color text indicator, partially mitigating this for text prefixes. However, the color distinction between required/excluded cannot be perceived by color-blind users.

For chip prefixes (`FieldValueChip.svelte`, `RangeChip.svelte`), the `+`/`-` text is present alongside the color, which is sufficient per WCAG 1.4.1 (Use of Color). The text character serves as the non-color indicator.

**Assessment:** The text prefixes (`+`/`-`) satisfy WCAG 1.4.1 since meaning is conveyed by both color and text. No fix required for compliance, but enhanced visual differentiation (e.g., bold weight or background for required) would improve usability.

#### Finding 5.2 — Contrast of decoration backgrounds needs verification (Minor)

The following CSS custom properties are used for decoration backgrounds but their actual hex values depend on the theme:
- `var(--purple-1)` for AND/OR/NOT operator backgrounds
- `var(--gray-1)` for parenthesis backgrounds
- `var(--green-3)` for required prefix text
- `var(--orange-3)` for excluded prefix text

**Recommended fix:** Verify contrast ratios of all decoration colors against their text colors in both light and dark themes. Document the results.

#### Finding 5.3 — Syntax error indicator is visual-only (Major)

`SearchEditor.svelte` ~line 232: The `.search-syntax-error` class applies a red wavy underline and color change. There is no screen reader announcement when a syntax error is detected or resolved.

**Recommended fix:** Announce syntax errors via an `aria-live` region (e.g., "Query syntax error detected") and clear the announcement when the error is resolved.

---

## Summary

| # | Issue | Severity | Section | Status |
|---|-------|----------|---------|--------|
| 3.1 | Chips have no `role` or `aria-label` | Critical | Chips | **Fixed** |
| 1.1 | Editor textbox has no accessible name | Critical | ARIA | **Fixed** |
| 5.1 | Prefix decorations use color only (mitigated by text) | Critical (mitigated) | Color | No fix needed |
| 1.4 | Autocomplete options lack concatenated `aria-label` | Major | ARIA | **Fixed** |
| 1.5 | No live region announcement for stage transitions | Major | ARIA | **Fixed** |
| 2.2 | ChipEditor dialog has no focus trap | Major | Keyboard | **Fixed** |
| 2.3 | RangeBuilder keyboard navigation incomplete | Major | Keyboard | Deferred |
| 3.2 | Chips not independently keyboard-focusable | Major | Chips | Deferred |
| 3.3 | Chip selection state not announced | Major | Chips | Deferred |
| 4.1 | No `aria-invalid` when query is invalid | Major | Form | **Fixed** |
| 5.3 | Syntax error indicator is visual-only | Major | Color | **Fixed** |
| 1.2 | `aria-owns` should be `aria-controls` | Minor | ARIA | **Fixed** |
| 1.3 | Dropdown listbox has no `aria-label` | Minor | ARIA | **Fixed** |
| 1.6 | No `aria-busy` during async loading | Minor | ARIA | **Fixed** |
| 4.2 | Form has no accessible label | Minor | Form | **Fixed** |
| 5.2 | Decoration contrast needs verification | Minor | Color | Deferred |
