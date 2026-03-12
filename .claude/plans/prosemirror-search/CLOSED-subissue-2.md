# Feat: Click to Edit Chips

## Goal

Make chips interactive: clicking a chip opens a popover with editing controls for modifiers (required, excluded, boost). Clicking a sort chip toggles its direction. To change a chip's value, the user deletes it and creates a new one.

## Current State

- Chips are rendered as Svelte components (`FieldValueChip`, `RangeChip`, `SortChip`) via ProseMirror NodeViews.
- Clicking a chip selects it in ProseMirror (blue outline via `ProseMirror-selectednode`).
- No click handlers, no edit UI, no popover.
- The `Dropdown` component in `src/lib/components/common/Dropdown.svelte` uses `@floating-ui/dom` and provides a slot-based popover pattern with close callbacks.

## Design

### Edit Chip Popover (field-value and range nodes)

A generic `ChipEditor` component provides controls for modifiers shared across chip types:

- **Required** (`+` prefix): toggle button
- **Excluded** (`-` prefix): toggle button
- **Boost** (`^N`): numeric stepper (field-value only, not range)
- **Delete**: button to remove the chip

The popover opens anchored to the chip. It reads the current node attributes and dispatches ProseMirror transactions (`tr.setNodeMarkup()`) to update them.

```
┌──────────────────────┐
│  ☐ Required  ☐ Excluded │
│  Boost: [1] [+] [-]     │
│                          │
│  [Delete]                │
└──────────────────────────┘
```

Required and Excluded are mutually exclusive (selecting one deselects the other). They map to the `prefix` attribute: `"+"`, `"-"`, or `null`.

### Sort Chip: Click to Toggle

Clicking a sort chip toggles its `direction` attribute between `"asc"` and `"desc"`. No popover needed — the click handler dispatches a transaction directly. The chip re-renders with the updated arrow (↑/↓).

A long-press or right-click could open a popover with a "Delete" option, but for MVP, Backspace/Delete when the chip is selected handles removal.

### NodeView Integration

The `SvelteNodeView` class in `nodeviews.ts` needs to:

1. Pass `view`, `getPos`, and a callback to open the editor to the Svelte component.
2. For field-value and range chips: on click, open the `ChipEditor` popover.
3. For sort chips: on click, toggle direction via `tr.setNodeMarkup()`.
4. `stopEvent()` must return `true` for click events so ProseMirror doesn't consume them.

### ChipEditor Component

A new Svelte component: `src/lib/components/documents/search/ChipEditor.svelte`

Props:
- `node`: ProseMirror node (to read current attrs)
- `pos`: document position (from `getPos()`)
- `view`: EditorView (to dispatch transactions)
- `anchor`: DOM element (the chip element, for Floating UI positioning)
- `onClose`: callback

The component uses `@floating-ui/dom` directly (like the autocomplete dropdown does) rather than wrapping in the common `Dropdown` component, since the trigger is a ProseMirror NodeView, not a standard Svelte slot.

### Keyboard Support

- When a chip is selected (node selection) and the user presses Enter or Space, open the popover.
- Escape closes the popover and returns focus to the editor.
- Tab navigates between controls within the popover.

## Files to Modify

| File | Change |
|------|--------|
| `nodeviews.ts` | Pass `view` and `getPos` to Svelte components. Add click handling: sort toggles direction, others open ChipEditor. Update `stopEvent()` for click events. |
| `FieldValueChip.svelte` | Accept `onEdit` callback prop, dispatch on click. |
| `RangeChip.svelte` | Accept `onEdit` callback prop, dispatch on click. |
| `SortChip.svelte` | Accept `onToggle` callback prop, toggle direction on click. |
| `ChipEditor.svelte` (new) | Popover component with required/excluded toggles, boost stepper, delete button. |
| `plugins/autocomplete.css` or new CSS | Styles for the chip editor popover. |
| `tests/SearchEditor.test.ts` | Click chip → popover opens. Toggle required → prefix updates. Toggle sort → direction changes. Delete chip via popover. |
| `stories/SearchEditor.stories.svelte` | Story demonstrating chip editing. |

## Out of Scope

- Changing a chip's value (field or value) via the popover. Users delete and re-add.
- Inline text editing of chip content.
- Drag-and-drop reordering of chips.
