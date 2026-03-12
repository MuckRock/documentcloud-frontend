# Subissue 8: Deferred Accessibility Fixes

Remaining accessibility issues from the audit in subissue-3 that require deeper architectural work.

## SOLVED ~~2.3 — RangeBuilder keyboard navigation is incomplete (Major)~~

**Problem:** RangeBuilder has three interaction zones — a "Fixed value" input+button, a list of shortcut `role="option"` items, and a "Custom range" pair of inputs+button — all wrapped in a single `role="listbox"` container. This is semantically incorrect: `listbox` children must be `option` elements, not form controls.

Keyboard navigation only works for the shortcut options (ArrowUp/Down, handled by the autocomplete plugin at `autocomplete.svelte.ts:621-646`). Tab is intercepted by the plugin to accept the selected suggestion (`autocomplete.svelte.ts:649-661`), so users cannot Tab into the input fields. The only way to reach the fixed-value or custom-range inputs is with a mouse click.

**Files:** `RangeBuilder.svelte`, `autocomplete.svelte.ts`

**Recommended approach:**
1. Change RangeBuilder's role from `listbox` to `dialog` (or remove the role and use a composite pattern with labeled sections).
2. Add a range-stage-specific code path in `handleKeyDown` that does **not** intercept Tab, allowing natural Tab order through: fixed input → Insert button → shortcut options → start input → end input → Insert button.
3. ArrowUp/Down should only navigate the shortcut options when one of them has focus, not when an input has focus.
4. Escape should still dismiss the entire range builder.

## SOLVED ~~3.2 — Chips are not independently keyboard-focusable (Major)~~

**Problem:** The chip wrapper `<span>` created in `nodeviews.svelte.ts:46-51` has `contentEditable="false"` but no `tabindex` and no ARIA role. ProseMirror's NodeSelection visually highlights the chip and triggers `selectNode()`, but this is internal to ProseMirror — it doesn't move DOM focus to the chip element. Screen readers in browse/virtual-cursor mode skip the chip entirely.

**Files:** `nodeviews.svelte.ts`, `autocomplete.svelte.ts` (for ARIA attribute coordination)

**Why this is hard:** Adding `tabindex="-1"` and calling `this.dom.focus()` in `selectNode()` would break ProseMirror's focus model — the editor `<div>` must retain DOM focus for typing to work. ProseMirror expects to own focus at all times; moving it to a child node would cause the editor to fire blur events.

**Recommended approach:** Use the `aria-activedescendant` pattern (same pattern already used for autocomplete suggestions):
1. Give each chip wrapper an `id` (e.g., `search-chip-{pos}`).
2. Add `tabindex="-1"` to the wrapper so it's a valid `aria-activedescendant` target.
3. When `selectNode()` fires, set `aria-activedescendant` on the editor DOM to point at the chip's `id`. The chip's `aria-label` (already added in subissue-3) will then be announced.
4. When `deselectNode()` fires, remove `aria-activedescendant` from the editor.
5. IDs need to update when the document changes (chip positions shift), so they may need to be based on a stable identifier rather than PM position.

**Note:** This approach solves 3.3 as well — `aria-activedescendant` pointing at a labeled element triggers an automatic screen reader announcement.

## SOLVED ~~3.3 — Chip selection state is not announced (Major)~~

**Problem:** When a user arrows into a chip, `selectNode()` adds a CSS class and opens ChipEditor, but nothing announces to screen readers that a chip was selected, what it contains, or what actions are available.

**Solution:** The `aria-activedescendant` pattern from 3.2 provides the announcement mechanism. Added `computeChipLabel()` to `nodeviews.svelte.ts` which generates an accessible label from node type and attributes (e.g., `"required, user: Mitchell Kotler"`, `"created_at: from NOW-1MONTH to *"`, `"Sort by page_count, descending"`). The label is set on the NodeView wrapper DOM element in the constructor and updated in `update()` when attributes change. Since `aria-activedescendant` points to the wrapper, screen readers now announce the chip's content when it receives a NodeSelection.

## SOLVED ~~5.2 — Decoration contrast needs verification (Minor)~~

**Problem:** Several color pairings failed WCAG 2.1 AA contrast (4.5:1 for normal text).

**Audit results and fixes applied:**

| Element | Before | After | Ratio |
|---------|--------|-------|-------|
| AND/OR/NOT operators (gray-5 on purple-1) | — | No change needed | 10.84:1 PASS |
| Parentheses (gray-5 on gray-1) | — | No change needed | 11.15:1 PASS |
| Required `+` prefix (decoration) | `--green-3` (2.17:1) | `--green-4` | 5.52:1 PASS |
| Excluded `-` prefix (decoration) | `--orange-3` (2.76:1) | `--orange-4` | 7.16:1 PASS |
| Blue chip text (blue-5 on blue-1) | — | No change needed | 10.40:1 PASS |
| Blue chip label (0.7 opacity) | — | No change needed | 4.64:1 PASS |
| Green chip text (green-5 on green-1) | — | No change needed | 9.90:1 PASS |
| Green chip label (0.7→0.75 opacity) | 4.37:1 | opacity 0.75 | 4.98:1 PASS |
| Chip `+` prefix (green-3 on green-1) | 2.00:1 | `color: inherit` (green-5) | 9.90:1 PASS |
| Red chip text (red-5 on red-1) | — | No change needed | 12.49:1 PASS |
| Chip `-` prefix (orange-3 on red-1) | 2.34:1 | `color: inherit` (red-5) | 12.49:1 PASS |
| Purple chip text (purple-5 on purple-1) | — | No change needed | 12.02:1 PASS |
| Purple chip label (0.7 opacity) | — | No change needed | 5.00:1 PASS |

**Changes made:**
- `SearchEditor.svelte`: Decoration prefix colors changed from `-3` to `-4` variants
- `FieldValueChip.svelte`, `RangeChip.svelte`: Chip prefix colors changed to `inherit` (uses chip's own text color); chip-field label opacity bumped from 0.7 to 0.75
