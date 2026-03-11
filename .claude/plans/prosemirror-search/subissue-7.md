# Refactor: Autocomplete Dropdown as Svelte Components

## Goal

Replace the imperative DOM construction in `plugins/autocomplete.ts` with Svelte components. The autocomplete dropdown and range builder currently use `document.createElement` / `innerHTML` to build their UI, while every other visual element (chips, chip editor) is a Svelte component. This refactor aligns the autocomplete UI with the rest of the codebase.

## Current State

The autocomplete plugin (`plugins/autocomplete.ts`) is ~1360 lines. Roughly 300 lines are dedicated to imperatively constructing and updating dropdown DOM:

- **`createDropdown()`** — creates a `<div>` with `role="listbox"`, appended to `document.body`.
- **`renderDropdown()`** — clears `innerHTML`, loops over suggestions to create option elements with event listeners, manages selected state via class toggling.
- **`renderRangeDropdown()`** — builds a complex form with section labels, input fields, buttons, separators, and event listeners — all via `createElement`.
- **`updateRangeSelection()`** — manually toggles `.selected` class and `aria-selected` attributes.
- **`positionDropdown()`** — uses `@floating-ui/dom` with a virtual element from `view.coordsAtPos`.
- **`createLiveRegion()`** / **`announceCount()`** — screen reader announcement region.

Styles live in a separate `autocomplete.css` file imported into `SearchEditor.svelte`.

## Design

### New Svelte Components

#### `AutocompleteDropdown.svelte`

The main dropdown container. Receives suggestions and renders them as a listbox.

Props:
- `suggestions: Suggestion[]` — current suggestion list
- `selectedIndex: number` — highlighted item index
- `loading: boolean` — whether async results are pending
- `anchor: { top: number; bottom: number; left: number }` — positioning coordinates (from `view.coordsAtPos`)
- `onSelect: (index: number) => void`
- `onHover: (index: number) => void`

Handles:
- Rendering option items with label + description
- Selected state highlighting
- Loading indicator
- Scroll-into-view for selected item
- Positioning via `@floating-ui/dom` (same pattern as `ChipEditor.svelte`)
- ARIA attributes (`role="listbox"`, `aria-selected`, option IDs)

#### `RangeBuilder.svelte`

The range-specific dropdown with shortcuts, custom range inputs, and fixed value input.

Props:
- `fieldName: string`
- `suggestions: Suggestion[]` — range shortcuts
- `selectedIndex: number`
- `onSelect: (index: number) => void`
- `onHover: (index: number) => void`
- `onCustomRange: (lower: string, upper: string) => void`
- `onFixedValue: (value: string) => void`
- `anchor: { top: number; bottom: number; left: number }`

Handles:
- Fixed value section (label input, insert button)
- Range shortcut list
- Custom range inputs (start/end with labels from `rangeConfig`)
- Date vs number input types
- Insert button + Enter key submission
- `mousedown` stopPropagation on inputs (to prevent dropdown dismissal)

#### `LiveRegion.svelte` (optional)

A small component for the `aria-live` region. May be simple enough to inline in the dropdown.

### Plugin Changes

The plugin's `view()` method currently creates DOM and manages it directly. After refactoring:

1. **Mount**: Instantiate `AutocompleteDropdown` (or `RangeBuilder`) as a Svelte component, appended to `document.body` via a container div — same pattern as `nodeviews.ts` uses for `ChipEditor`.
2. **Update**: Call `component.$set()` with new props when plugin state changes, instead of calling `renderDropdown()` / `renderRangeDropdown()`.
3. **Destroy**: Call `component.$destroy()` and remove the container.

The plugin's state machine (`AutocompleteState`), `handleKeyDown`, suggestion computation, and async fetch logic are **unchanged** — only the rendering layer moves to Svelte.

### ARIA Integration

The editor's ARIA attributes (`aria-expanded`, `aria-owns`, `aria-activedescendant`) are currently set imperatively in the plugin's `update()` callback. These can stay in the plugin since they target the editor DOM, not the dropdown. Alternatively, the dropdown component could emit its listbox ID on mount for the plugin to wire up.

### Positioning

Currently uses a virtual element from `view.coordsAtPos()`. The Svelte component receives pre-computed anchor coordinates as a prop rather than taking `view` and `pos` directly — keeping ProseMirror concerns in the plugin, visual concerns in Svelte.

## Files to Create

| File | Description |
|------|-------------|
| `AutocompleteDropdown.svelte` | Suggestion listbox component |
| `RangeBuilder.svelte` | Range/fixed value form component |

## Files to Modify

| File | Change |
|------|--------|
| `plugins/autocomplete.ts` | Replace `createDropdown`, `renderDropdown`, `renderRangeDropdown`, `updateRangeSelection`, `positionDropdown`, `createLiveRegion`, `announceCount` with Svelte component mount/update/destroy. Keep state machine, key handling, suggestion logic, and async fetch. |
| `plugins/autocomplete.css` | Move styles into Svelte component `<style>` blocks. Delete file when done. |
| `SearchEditor.svelte` | Remove `import "./plugins/autocomplete.css"` |
| `tests/SearchEditor.test.ts` | Tests should pass unchanged — the dropdown's DOM structure and ARIA attributes stay the same. |

## Migration Strategy

1. Start with `AutocompleteDropdown.svelte` for the standard suggestion list (field and value stages).
2. Wire it into the plugin's `view()` method, replacing `createDropdown` + `renderDropdown`.
3. Then build `RangeBuilder.svelte` for the range stage, replacing `renderRangeDropdown`.
4. Move CSS into component `<style>` blocks and delete `autocomplete.css`.
5. Run existing tests to verify no regressions.

## Out of Scope

- Changing autocomplete behavior, suggestion logic, or keyboard handling.
- Refactoring the plugin state machine or async fetch logic.
- Adding new autocomplete features.
