# Task: Address Test Coverage Gaps

## Goal

Fill the identified test coverage gaps in the SearchEditor integration tests. These are behaviors that work end-to-end but lack dedicated test assertions.

## Coverage Gaps

### 1. Autocomplete Insertion Flow (Priority: High)

No test covers the full cycle: type field prefix → select field from dropdown → select value → verify chip node in document with correct attributes.

**Tests to add:**
- Type `acc` → ArrowDown to `access` → Enter → dropdown shows values → ArrowDown to `public` → Enter → verify `field-value` node with `{ field: "access", value: "public" }`.
- Type `sort` → select `sort` → select `Created (newest)` → verify `sort` node with `{ field: "created_at", direction: "asc" }`.

### 2. Keyboard Navigation in Autocomplete (Priority: High)

Arrow key navigation, Enter/Tab selection, and Escape dismissal are implemented but not fully tested at the integration level.

**Tests to add:**
- ArrowDown cycles through suggestions, wraps at bottom.
- ArrowUp cycles in reverse, wraps at top.
- Enter selects the highlighted suggestion.
- Tab selects the highlighted suggestion.
- Escape dismisses the dropdown; `aria-expanded` becomes `false`.

### 3. Mod+/ Shortcut (Priority: Medium)

The `Mod+/` keystroke opens the full field list. No integration test for this.

**Tests to add:**
- Press Mod+/ in empty editor → dropdown opens with all fields.
- Press Mod+/ with cursor after text → dropdown opens with all fields (not filtered).
- Press Escape after Mod+/ → dropdown closes.

### 4. Mouse Interaction (Priority: Medium)

Click and hover behaviors in the autocomplete dropdown.

**Tests to add:**
- Hover over a suggestion → it becomes highlighted (`aria-selected="true"`).
- Click a suggestion → it's selected and inserted.
- Click outside the dropdown → dropdown dismisses.

### 5. Chip Keyboard Interaction (Priority: Medium)

Navigation around and deletion of chips.

**Tests to add:**
- Arrow keys move cursor around chips (before/after).
- When a chip is selected (node selection), Backspace deletes it.
- When a chip is selected, Delete key deletes it.
- Arrow Left from after a chip selects the chip; another Arrow Left moves before it.

### 6. Live Region Announcements (Priority: Low)

The `aria-live` region announces suggestion counts but this isn't tested.

**Tests to add:**
- When autocomplete activates with 3 suggestions, live region text includes "3 suggestions available".
- When suggestions are filtered to 1, live region updates to "1 suggestion available".
- When autocomplete dismisses, live region is cleared.

### 7. Edge Cases (Priority: Low)

**Tests to add:**
- Typing a complete field name that exactly matches (e.g., `access`) still shows suggestions.
- Backspace while autocomplete is open updates the filter.
- Rapid typing doesn't produce stale suggestion results (debounce correctness).

## Files to Modify

| File | Change |
|------|--------|
| `tests/SearchEditor.test.ts` | Add all test cases above in new `describe` blocks. |

## Notes

- Tests should use `@testing-library/svelte` with `fireEvent` for keyboard and mouse events.
- Async autocomplete tests need `vi.useFakeTimers()` and `vi.runAllTimersAsync()` for debounce handling.
- ProseMirror keyboard events go through the editor's `handleKeyDown`, so use `fireEvent.keyDown` on the ProseMirror content-editable element.
