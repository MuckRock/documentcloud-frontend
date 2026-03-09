# Bug: Autocomplete Not Activating After Chip With One Space

## Problem

When the cursor is positioned after `[chip] ` (one space) and the user types a field name prefix like `acc`, the autocomplete dropdown does not appear. It works correctly with two spaces after the chip, or when there are no chips before the cursor.

## Expected Behavior

Typing a field name prefix after a single space following a chip should activate autocomplete, just as it does in all other positions.

## Suspected Root Cause

`doc.textBetween()` is used to extract text before the cursor for trigger detection. It accepts a `leafText` parameter to represent inline atom nodes (chips) as text. The chip's leaf-text representation likely includes a trailing space that merges with the user-typed space, causing `detectTrigger()` to see the wrong word boundary.

Specifically, in `autocomplete.ts`, `computeAutocompleteState()` calls something like:

```ts
const textBeforeCursor = doc.textBetween(paragraphStart, cursorPos, "", " ");
```

The `" "` leaf text parameter means each atom node is represented as a single space. So after `[chip] acc`, the text becomes `" acc"` — but the space from the chip and the typed space may collapse or shift the word boundary detection in `detectTrigger()`.

## Investigation Steps

1. Add a `console.log` in `computeAutocompleteState()` to print `textBeforeCursor` when typing after a chip with one space vs. two spaces.
2. Compare the extracted text to confirm the leafText collision theory.
3. Check if `doc.textBetween()` has an option to use a different separator, or if we need to adjust the paragraph start position to skip chips.

## Potential Fixes

1. **Use a non-space leafText marker** (e.g., `"\0"` or `"\u200B"`) and strip it before passing to `detectTrigger()`. This prevents collision with typed spaces.
2. **Calculate `textBeforeCursor` differently** — instead of `textBetween` from paragraph start, walk backward from the cursor through text nodes only, stopping at the first non-text node.
3. **Adjust `detectTrigger()`** to be aware that the "last space" might be a chip boundary, not a typed space.

Option 2 is likely the cleanest fix since it avoids the leafText ambiguity entirely.

## Files to Modify

| File | Change |
|------|--------|
| `plugins/autocomplete.ts` | Fix `textBeforeCursor` extraction in `computeAutocompleteState()` to correctly handle text after chips. |
| `tests/SearchEditor.test.ts` | Add test: insert a chip programmatically, type one space then a field prefix → autocomplete activates. |

## Reproduction

1. Open the SearchEditor (Storybook or app).
2. Type `user:` and select a user from autocomplete → chip is inserted with a trailing space.
3. Type `acc` immediately after the space.
4. **Expected**: autocomplete dropdown shows `access`.
5. **Actual**: no dropdown appears.
6. Type another space before `acc` (so there are two spaces after the chip) → autocomplete works.
