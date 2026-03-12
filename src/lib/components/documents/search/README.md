# Document Search

**Document Search** is a powerful, interactive UI for building complex Lucene search strings for use with DocumentCloud's Solr backend.

## Architecture

### Svelte Components

**SearchEditor** (`SearchEditor.svelte`) is the root component. It renders a form containing a status icon, context chips, the ProseMirror editor, and a search button. It accepts an `initialQuery` string, optional `contextChips` (locked chips displayed before the editor, e.g. for project scope), and `preloadedSuggestions` from search results. It exposes `updateQuery()`, `getQuery()`, and `getView()` methods for programmatic control. Only structural changes (chip insert/remove) emit `change` events — plain text typing does not.

The chip components render the atom nodes inside the editor:

- **FieldValueChip** (`FieldValueChip.svelte`) — Displays a field-value pair with optional prefix indicator (+/-), boost badge, and loading state for entity fields awaiting display name enrichment. Automatically formats ISO dates as locale strings.
- **RangeChip** (`RangeChip.svelte`) — Displays a range query with field name, inclusive/exclusive brackets, and formatted bounds.
- **SortChip** (`SortChip.svelte`) — Displays a sort directive with field name and directional arrow (ascending/descending). Styled with a purple background to distinguish it from field-value chips.

The interactive overlay components are mounted to `document.body` by their respective plugins:

- **ChipEditor** (`ChipEditor.svelte`) — A popover anchored to a selected chip for editing its prefix (Require/Exclude), boost value, or deleting it. Positioned with `@floating-ui/dom`. Supports keyboard navigation (Escape to close, ArrowUp to return focus to the editor).
- **AutocompleteDropdown** (`AutocompleteDropdown.svelte`) — The suggestion listbox for field and value stages. Shows selectable options with optional descriptions and a loading state. Auto-scrolls the selected item into view.
- **RangeBuilder** (`RangeBuilder.svelte`) — The range stage dropdown with three sections: a fixed single-value input, preset range shortcuts, and custom start/end range inputs. Renders date or number inputs depending on the field type.

### ProseMirror Document Editor

The editor uses **ProseMirror** for a fully interactive editing experience.

We define a document schema in `./prosemirror/schema.ts`. The ProseMirror document is our source of truth for the editor. Any Lucene search strings are serialized into this document schema; the document is serialized into Lucene before we send it to our search endpoint.

When we render custom UI inside our editor, we use a bridge between ProseMirror and Svelte that is defined by `./prosemirror/nodeviews.ts`. We use Svelte to render chips for our atomic nodes: field/value terms, range terms, and sort terms. We also use it to render the list of suggestions for our autocomplete, and the popover editor for customizing parameters of each atomic node.

We construct our ProseMirror editor in `./prosemirror/searchEditor.ts`. The editor is configured with our schema and our nodeviews, as well as a number of plugins:

#### Plugins

##### Autocomplete (`plugins/autocomplete.ts`)

The most complex plugin. It implements a multi-stage suggestion system with a state machine:

- **Field stage** — As the user types, a dropdown shows matching field names (e.g. `user`, `created_at`, `tag`).
- **Value stage** — After selecting a field, the dropdown shows value suggestions. Enum fields like `access` and `status` have static suggestions; entity fields like `user`, `organization`, and `project` fetch suggestions asynchronously from the API.
- **Range stage** — For date and numeric fields, a modal range builder appears with shortcut options (e.g. "Last week", "Last month") and custom input.

The plugin handles keyboard navigation (arrow keys, Enter/Tab to accept, Escape to dismiss), manages floating-UI positioning for the dropdown and range builder, and sets ARIA attributes for accessibility. It also supports a `Mod-/` shortcut to open the full field picker.

Autocomplete data and API integration live in `plugins/autocomplete-data.ts`, which defines the field catalog, static value enums, range configurations, and async fetch functions for entity suggestions and display names.

##### Decoration (`plugins/decoration-plugin.ts`)

Applies visual syntax highlighting to the editor without modifying the document. It decorates:

- **Boolean operators** — `AND`, `OR`, `NOT`
- **Parentheses** — `(` and `)`
- **Prefix operators** — `+` (required) and `-` (excluded)
- **Syntax errors** — Wavy underlines for invalid constructs like empty quotes, unbalanced quotes, and incomplete ranges

Error detection runs validation after each transaction and maps error regions in the serialized query string back to ProseMirror document positions.

##### Atom Navigation (`plugins/atom-navigation-plugin.ts`)

Provides keyboard navigation for inline atom nodes (chips):

- **ArrowLeft/ArrowRight** — When the cursor is adjacent to a chip, selects it rather than jumping over it.
- **ArrowDown** — When an editable chip (field-value or range) is selected, moves focus into its popover editor.

##### Clipboard (`plugins/clipboard-plugin.ts`)

Handles copy/paste serialization between the structured ProseMirror document and plain Lucene text:

- **Copy/Cut** — Serializes the selected ProseMirror fragment to a Lucene string and writes it to the clipboard as plain text.
- **Paste** — Intercepts pasted text, runs it through the Lucene parser, and produces a ProseMirror slice with appropriate chip nodes for recognized terms and text nodes for everything else.

##### Placeholder (inline in `searchEditor.ts`)

A simple plugin that toggles an `is-empty` CSS class on the editor DOM when the document is empty, allowing CSS to display placeholder text.

##### History

The standard ProseMirror `history()` plugin for undo/redo, with keybindings for `Mod-z` (undo) and `Mod-y` / `Mod-Shift-z` (redo).

### Utils

These three modules form a bidirectional transformation layer between Lucene query strings and ProseMirror documents:

- **deserialize** (`utils/deserialize.ts`) — Parses a Lucene query string into a ProseMirror document. Recognized patterns (field-value pairs, ranges, sort directives) become chip nodes; everything else becomes text. Falls back to plain text if parsing fails.
- **serialize** (`utils/serialize.ts`) — Converts a ProseMirror document or fragment back into a Lucene query string. Handles spacing between atoms, quoting, boost syntax, and range brackets.
- **parse** (`utils/parse.ts`) — Lower-level query analysis. Exports `validateQuery()` for syntax validation with error positions, `validField()` for checking field names against allowed patterns, `parse()` for producing a Lucene AST, and `highlight()` / `parseHighlight()` for breaking a query into syntax-highlighted segments.
