# Search Editor Spec

An interactive search field built with ProseMirror that helps users construct complex Lucene queries while maintaining full text editability.

## Goals

- **Guided construction**: Help users discover and use search fields they may not know about, with autocomplete for field names and contextual value suggestions.
- **Rich display**: Show structured query parts (like `user:102112`) as readable chips (like `User: Mitchell Kotler`) while keeping the underlying query valid.
- **Text-first editing**: Users can always type raw Lucene syntax directly. The editor enhances but never restricts.
- **Visual clarity**: Boolean operators (`AND`, `OR`, `NOT`) and grouping parentheses get lightweight styling so the query structure is scannable at a glance.

## Supported Lucene Syntax

DocumentCloud's search is powered by Solr. The editor must support the full query syntax:

### Text Search

| Syntax | Example | Description |
|--------|---------|-------------|
| Single term | `report` | Matches documents containing the word |
| Phrase | `"the mueller report"` | Matches the exact phrase |
| Wildcard | `J*`, `?oat` | `*` matches zero or more chars, `?` matches one |
| Fuzzy | `book~`, `book~1` | Edit-distance matching (default distance 2) |
| Proximity | `"mueller report"~10` | Words within N words of each other |
| Boosting | `mueller^4 report` | Alter ranking weight of a term |

### Boolean Operators and Grouping

| Syntax | Example | Description |
|--------|---------|-------------|
| `AND` | `mueller AND report` | Both terms required |
| `OR` | `mueller OR report` | Either term matches (default) |
| `NOT` | `NOT mueller` | Exclude term |
| `+` prefix | `+mueller` | Require term |
| `-` prefix | `-report` | Exclude term |
| Parentheses | `(mueller OR watergate) AND report` | Group terms for precedence |

### Filter Fields

Filter fields narrow results by document properties. By default, multiple filter fields of the same type are `OR`ed together, and different field types are `AND`ed.

| Field | Format | Notes |
|-------|--------|-------|
| `user` | `user:102112` or `user:mitchell-kotler-1` | Alias: `account` |
| `organization` | `organization:1` or `organization:muckrock-1` | Alias: `group` |
| `project` | `project:214246` or `project:panama-papers-1` | Alias: `projects` |
| `document` | `document:20059100` | Alias: `id` |
| `access` | `access:public` | Values: `public`, `organization`, `private` |
| `status` | `status:success` | Values: `success`, `readable`, `pending`, `error`, `nofile` |
| `language` | `language:eng` | ISO 639-3 codes |
| `tag` | `tag:significant` | Alias for `data__tag` |
| `data_*` | `data_Folder:"Environmental docs"` | Arbitrary key/value metadata |
| `slug` | `slug:the-mueller-report` | Document slug |

### Date/Time Fields

| Field | Format | Notes |
|-------|--------|-------|
| `created_at` | `created_at:[NOW-1MONTH TO *]` | Supports date math |
| `updated_at` | `updated_at:["2024-01-01T00:00:00Z" TO "2024-01-31T00:00:00Z"]` | Full ISO 8601 |

Date math: `NOW`, `NOW-1MONTH`, `NOW+2DAYS`, `NOW/HOUR` (rounding). Units: `YEAR`, `MONTH`, `DAY`, `HOUR`, `MINUTE`, `SECOND`, `MILLISECOND`.

### Numeric Fields

| Field | Format | Notes |
|-------|--------|-------|
| `page_count` | `page_count:41` or `pages:[100 TO 200]` | Alias: `pages` |

### Text-Specific Fields

| Field | Format | Notes |
|-------|--------|-------|
| `title` | `title:Mueller*` | Document title |
| `source` | `source:gema` | Document source |
| `description` | `description:Mueller*` | Document description |
| `text` | `text:Russian` | Full document text. Alias: `doctext` |
| `page_no_*` | `page_no_4:Russian` | Text on a specific page |

### Range Syntax

| Syntax | Meaning |
|--------|---------|
| `[min TO max]` | Inclusive range |
| `{min TO max}` | Exclusive range |
| `[min TO max}` | Mixed (inclusive lower, exclusive upper) |
| `[min TO *]` | Open-ended upper bound |
| `[* TO max]` | Open-ended lower bound |

### Sort

| Syntax | Example | Description |
|--------|---------|-------------|
| `sort:field` | `sort:created_at` | Sort ascending |
| `sort:-field` | `sort:-page_count` | Sort descending |

Sort fields: `score`, `created_at`, `page_count`, `title`, `source`, `data_*`.

## Architecture

ProseMirror is the **source of truth** for the query. Serialization to a Lucene string happens only when the query is submitted. Deserialization from a Lucene string happens only when loading a saved query.

```
                    ┌─────────────────────────────────────────────┐
                    │              ProseMirror Editor              │
                    │                                             │
                    │  Schema          NodeViews        Plugins   │
                    │  ───────         ─────────        ───────   │
                    │  doc             FieldValue       Decorate  │
                    │  └─ paragraph    (Svelte)         (AND/OR/  │
                    │     ├─ text                        NOT, ())│
                    │     ├─ field     Range                      │
                    │     │  Value     (Svelte)         Auto-     │
                    │     ├─ range                      complete  │
                    │     └─ sort      Sort                       │
                    │                  (Svelte)         Keymap    │
                    │                                             │
                    └──────────────┬──────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
               serialize     deserialize     autocomplete
            (PM → string)  (string → PM)    (API lookups)
             on submit       on load        user, org, project
```

### No Bidirectional Sync

The previous implementation maintained a continuous loop: edit → serialize → re-parse → rebuild document. This caused complexity around infinite loop prevention, cursor position preservation, and intermediate states.

The new approach eliminates this entirely. The PM document *is* the query. We serialize only when we need a string (form submission, URL update). We deserialize only when we need to populate the editor (loading a saved search, reading a URL query param).

### Schema

The schema defines four content node types within a single `paragraph` block.

**Whitespace constraint:** The schema enforces at least one space between adjacent inline atom nodes (`field-value`, `range`, `sort`), and between atom nodes and text nodes. This prevents the user from creating ambiguous runs of chips with no separator. If this feels too rigid during testing, we can relax to serialization-time space injection instead.

**`field-value`** (inline, atom)
Represents a `field:value` pair for fields where the value is a selection from a known set or a database entity — not free-text scoring fields. Rendered as a chip via Svelte NodeView.

**Chipped fields** (rendered as `field-value` nodes):
- `user`, `organization`, `project`, `document` — database entities with display names
- `access`, `status`, `language` — enumerated values
- `tag` — known tag values

**Plain text fields** (remain as typed text, not chipped):
- `title`, `source`, `description`, `text`, `page_no_*` — free-text scoring fields
- `data_*` — deferred until API support exists (see [Future Work](#future-work))

| Attribute | Type | Description |
|-----------|------|-------------|
| `field` | string | Field name (e.g., `user`, `access`, `project`) |
| `value` | string | Raw value (e.g., `102112`, `public`) |
| `displayValue` | string? | Human-readable label (e.g., `Mitchell Kotler`) |
| `prefix` | `+` \| `-` \| null | Required/excluded modifier |
| `boost` | number? | Boost factor |
| `quoted` | boolean | Whether value was/should be quoted |

Serializes to: `[prefix][field]:["]value["][^boost]`

**`range`** (inline, atom)
Represents a range query. Rendered as a chip via Svelte NodeView.

| Attribute | Type | Description |
|-----------|------|-------------|
| `field` | string | Field name (e.g., `created_at`, `pages`) |
| `lower` | string | Lower bound (value or `*`) |
| `upper` | string | Upper bound (value or `*`) |
| `inclusiveLower` | boolean | `[` vs `{` |
| `inclusiveUpper` | boolean | `]` vs `}` |
| `prefix` | `+` \| `-` \| null | Required/excluded modifier |

Serializes to: `[prefix][field]:[lower TO upper]` (with `[]` or `{}` per inclusivity)

**`sort`** (inline, atom)
Represents a sort directive. Rendered as a chip via Svelte NodeView.

| Attribute | Type | Description |
|-----------|------|-------------|
| `field` | string | Sort field name |
| `direction` | `asc` \| `desc` | Sort direction |

Serializes to: `sort:[-]field`

**`text`** (inline)
Regular ProseMirror text nodes. Used for unqualified search terms, quoted phrases, wildcards, fuzzy terms, and everything else that's typed directly.

Serializes as-is: whatever the user typed.

### Decoration Plugin

A plugin that scans the document text after each transaction and applies **decorations** (not marks) for visual styling. Decorations are ephemeral and render-only; they don't affect the document model or serialization.

**Decorated patterns:**
- `AND`, `OR`, `NOT` — matched as whole words (`\b(AND|OR|NOT)\b`), styled with a subtle background and monospace font
- `(`, `)` — parentheses get a subtle background; matching pairs could be highlighted on cursor proximity
- `+`, `-` — prefix operators before terms, colored green/red respectively

This approach means users just type `AND` and it lights up. No special insertion flow needed.

### Svelte NodeViews

Each atomic node type gets a Svelte component as its NodeView. This enables:

- **Rich rendering**: `user:102112` displays as a chip reading "User: Mitchell Kotler"
- **Click to edit**: Clicking a chip could reopen its value picker
- **Accessible deletion**: Backspace/delete removes the whole chip
- **Contextual display**: Range nodes show human-readable date descriptions

NodeViews are responsible only for rendering. The node's attributes are the source of truth; the NodeView reads them and presents a visual.

### Autocomplete Plugin

A ProseMirror plugin that provides contextual suggestions as the user types.

**Two-stage flow:**

1. **Field stage**: User starts typing → plugin shows matching field names from the full field list (including plain-text fields like `title`, `data_*`, etc. for discoverability). Narrows as they type. Selecting a chippable field transitions to the value stage. Selecting a plain-text field inserts the field prefix (e.g., `title:`) as text and places the cursor after the colon for the user to continue typing.
2. **Value stage**: Based on the selected field, show appropriate value suggestions:
   - **Static values**: `access` → `public`, `organization`, `private`; `status` → `success`, `readable`, etc.; `language` → list of ISO codes
   - **API-backed search**: `user` → search users endpoint; `organization` → search orgs; `project` → search projects; `document` → search documents by title (resolves to document ID)
   - **Plain text fields**: `title`, `description`, `text`, `source`, `slug`, `data_*`, `page_no_*` → still appear in field-stage autocomplete for discoverability, but selecting one inserts the field prefix as text (e.g., `title:`) and the user types the value directly. No chip, no value-stage suggestions.
   - **Date picker**: `created_at`, `updated_at` → could offer date math shortcuts (`NOW-1MONTH`, etc.)
   - **Numeric input**: `page_count` → free numeric entry, or range builder

**Insertion behavior:**
When the user completes a selection, the plugin:
1. Replaces the typed text with the appropriate atomic node (`field-value`, `range`, or `sort`)
2. Adds a space after the node
3. Places the cursor after the space

**Activation:**
- Triggered when the user types 1+ alphanumeric characters that could be a field name
- Also triggered by an explicit keystroke (e.g., `/` or a toolbar button) to show all fields
- Dismissed by `Escape`, clicking away, or deleting back past the trigger point

**Positioning:**
Dropdown positioned below the cursor using a positioning library (e.g., Floating UI).

**Accessibility requirements (built in from the start):**
- Dropdown has `role="listbox"`
- Each suggestion has `role="option"` with a unique `id`
- The editor input uses `aria-expanded` to indicate dropdown visibility
- `aria-activedescendant` on the input tracks the currently highlighted option
- `aria-autocomplete="list"` on the input
- Screen readers announce the number of available suggestions via an `aria-live` region

### Serialization (PM Document → Lucene String)

A pure function that walks the ProseMirror document and produces a Lucene query string.

```
serialize(doc: ProseMirrorNode | Fragment): string
```

The function accepts either a full document node or a `Fragment` (for copy/paste of partial selections).

The walk is straightforward:
- **Text nodes**: emit their text content verbatim
- **`field-value` nodes**: emit `[prefix][field]:["]value["][~fuzzy][^boost]`
- **`range` nodes**: emit `[prefix][field]:[[ or {]lower TO upper[]or}]`
- **`sort` nodes**: emit `sort:[-]field`
- Whitespace between nodes preserved as-is from the document

No parsing, no AST, no intermediate representation. Just concatenate.

### Copy and Clipboard

When the user copies a selection from the editor, we serialize the selected fragment to a Lucene string and write it to the clipboard as plain text. This ensures:

- Copying `[+User: Mitchell Kotler] AND [Access: private]` puts `+user:mitchell-kotler-1 AND access:private` on the clipboard
- Pasting into another text field, a URL bar, or the API produces valid Lucene syntax
- Round-tripping works: copy from editor → paste into editor deserializes back to chips

Implementation: a ProseMirror plugin that handles the `copy` and `cut` DOM events, calls `serialize()` on the selected slice, and writes the result to `clipboardData`.

### Deserialization (Lucene String → PM Document)

A function that parses a Lucene query string and produces a ProseMirror document.

```
deserialize(query: string, schema: Schema): ProseMirrorNode
```

This uses the `lucene` npm package to parse the string into an AST, then converts recognized patterns into the appropriate node types. Anything not recognized as a structured node stays as text.

This runs in three scenarios:
1. **Loading a saved search** (from URL query params or stored filters)
2. **Pasting a query string** — paste is always deserialized. Decorations on operators like `NOT` are truthful: they reflect how Solr will actually interpret the text, which helps users catch unintended boolean logic.
3. **Copy** — when the user copies a selection, the selected fragment is serialized to a Lucene string and written to the clipboard as plain text.

It does *not* run continuously during editing.

**API enrichment**: After deserialization, field-value nodes for `user`, `organization`, and `project` are enriched with display names via parallel async API calls. While loading, chips display the raw value (e.g., `102112`) alongside a small loading indicator. Once the API responds, a transaction updates the `displayValue` attribute. Enrichment transactions locate their target node by matching `field` + `value` attributes, not by stored document positions, which ensures correctness even when multiple enrichments resolve concurrently.

## Example Queries and Editor Representation

### Simple text search

**Query**: `"steve jobs" macintosh`
**Editor**: Plain text, no chips. Quotes are literal characters.

```
┌──────────────────────────────────┐
│ "steve jobs" macintosh           │
└──────────────────────────────────┘
```

### Filter with text

**Query**: `+user:102112 report`
**Editor**: One chip for the user filter, plain text for the search term.

```
┌──────────────────────────────────────┐
│ [+User: Mitchell Kotler] report      │
└──────────────────────────────────────┘
```

### Boolean operators

**Query**: `mueller AND report`
**Editor**: Plain text with `AND` decorated.

```
┌──────────────────────────────────┐
│ mueller |AND| report             │
└──────────────────────────────────┘
          └─styled─┘
```

### Grouped query

**Query**: `(mueller OR watergate) AND report`
**Editor**: Parentheses and operators decorated, search terms as text.

```
┌──────────────────────────────────────────────┐
│ |(| mueller |OR| watergate |)| |AND| report  │
└──────────────────────────────────────────────┘
```

### Complex filter query

**Query**: `+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count`

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [+User: Mitchell Kotler] [Created: 11 months ago to 3 months ago] |AND| [Project: Panama Papers] [Sort: Page count ↑] │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Data key/value search

**Query**: `+data_Folder:"From ARMY site - Environmental documents" AND +data_Subfolder:38`
**Editor**: `data_*` fields remain as plain text (no chips) since we don't yet have API support for suggesting keys/values.

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ +data_Folder:"From ARMY site - Environmental documents" |AND| +data_Subfolder:38        │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Mixed structured and freeform

**Query**: `+user:102112 "classified documents" AND access:private title:Mueller*`

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ [+User: Mitchell Kotler] "classified documents" |AND| [Access: private] title:Mueller* │
└──────────────────────────────────────────────────────────────────────────────────┘
```

Note: `title:Mueller*` and `data_*` fields stay as plain text. Text-specific fields are scoring hints, and `data_*` fields lack API support for value suggestions. Both serialize correctly as-is.

## Interaction Patterns

### Constructing a query from scratch

1. User focuses the empty search field
2. User starts typing — if it matches a known field, autocomplete appears
3. User selects `user` from autocomplete → enters value stage
4. Value stage shows a user search input; user types "mitchell", sees results
5. User selects "Mitchell Kotler" → chip inserted: `[User: Mitchell Kotler]`
6. Cursor placed after chip with a space
7. User types `AND ` → `AND` gets operator decoration
8. User types `access:` → autocomplete shows `public`, `organization`, `private`
9. User selects `private` → chip inserted: `[Access: private]`
10. User presses Enter/submits → serialized to `user:mitchell-kotler-1 AND access:private`

### Editing an existing chip

1. User clicks on `[User: Mitchell Kotler]` chip
2. Chip enters edit mode (or a popover appears with current value)
3. User can change the value or delete the chip
4. On confirm, chip updates with new value

### Typing raw Lucene syntax

1. User types `+user:102112 created_at:[NOW-1MONTH TO *]` directly
2. The text remains as plain text — it's valid and will serialize correctly
3. Optionally, we could detect completed patterns and offer to "chip-ify" them, but this is not required. Raw text serializes identically.

### Loading a saved query

1. URL contains `?q=+user:102112+AND+access:private`
2. `deserialize()` runs, producing a PM doc with a `field-value` node for user, text ` AND `, and a `field-value` node for access
3. Async API call enriches user node with display name
4. Editor renders the structured, chip-ified query

### Pasting a query

1. User pastes `+user:102112 AND project:214246`
2. Paste handler intercepts, always runs `deserialize()` on pasted text
3. Inserts structured nodes where patterns are recognized
4. Falls back to plain text for anything unrecognized
5. Decorations apply to any recognized operators — this is intentional, as it reflects how Solr interprets the text

## Error Handling

Since ProseMirror is the source of truth and we only serialize on submit, there's no "parse error" state during editing. The user can type anything.

**Validation on submit:**
When the user submits, we serialize the PM doc to a Lucene string and can optionally validate it. If the server returns `escaped: true`, we know the query had a syntax error and was auto-corrected. We can surface this to the user.

**Invalid chips:**
If a chip has an invalid value (e.g., `user:` with no ID), the NodeView can visually indicate the error state, and serialization can either skip it or emit it as-is for the server to handle.

## Testing Strategy

All tests use Vitest with `@testing-library/svelte` and follow the project's existing conventions: test files colocated with source in `tests/` subdirectories, semantic queries (`getByRole`, `getByText`), and `describe`/`it` blocks.

We take a **red-green TDD** approach: write a failing test first, then implement the minimum code to make it pass. Each phase below includes the tests to write before the implementation.

**Two layers of tests:**

1. **Pure function tests** for `serialize()`, `deserialize()`, schema validation, and field metadata. These are fast, synchronous, and test the data transformations in isolation without rendering.
2. **Component tests** using `@testing-library/svelte` for the editor component and its interactive behaviors. These render the editor into jsdom and interact with it via `fireEvent` / user events.

## Phased Implementation

### Phase 1: Parser Evaluation & Core Editor

Establish the foundation: evaluate the `lucene` npm package against real DocumentCloud queries, then build a ProseMirror editor that can hold structured nodes and serialize them.

**Parser evaluation step:**
- Test the `lucene` npm package against real DocumentCloud query strings, documenting what parses correctly and what doesn't
- Key syntax to evaluate: `sort:field` / `sort:-field` (not standard Lucene), date math tokens (`NOW-1MONTH`, `NOW/DAY`) inside range values, `data_*` field names with arbitrary suffixes, prefix operators (`+`/`-`), and range syntax with mixed brackets
- If gaps are found, determine the strategy: pre-process strings before parsing, post-process the AST, or use a different/custom parser
- Unit tests serve as the permanent record of what works and what doesn't

**Core editor:**
- Define the ProseMirror schema (`doc`, `paragraph`, `text`, `field-value`, `range`, `sort`) with whitespace constraints between atom nodes
- Implement `serialize()` — walk the doc or fragment, produce a Lucene string
- Build the editor Svelte component with basic ProseMirror setup
- Wire up form submission: serialize on submit, pass string to search API
- Write a Storybook story for the editor in isolation

**Tests (write first):**
- `lucene-parser.test.ts` — Parser evaluation tests:
  - Standard Lucene: `field:value`, `"phrase"`, `field:[min TO max]`, `AND`/`OR`/`NOT`, `+`/`-` prefixes
  - DocumentCloud extensions: `sort:created_at`, `sort:-page_count`, `data_Folder:"test"`
  - Date math in ranges: `created_at:[NOW-1MONTH TO *]`, `updated_at:[NOW/DAY-7DAYS TO NOW/DAY]`
  - Complex real-world queries from production
- `serialize.test.ts` — Pure function tests for every node type:
  - Text-only documents: `"steve jobs" macintosh` → same string
  - `field-value` node: `{ field: "user", value: "102112", prefix: "+" }` → `+user:102112`
  - `field-value` with quoting: `{ field: "data_Folder", value: "From ARMY site", quoted: true }` → `data_Folder:"From ARMY site"`
  - `range` node: `{ field: "created_at", lower: "NOW-1MONTH", upper: "*" }` → `created_at:[NOW-1MONTH TO *]`
  - `sort` node: `{ field: "page_count", direction: "desc" }` → `sort:-page_count`
  - Mixed documents: text + nodes + text in sequence
  - Edge cases: empty doc, node with no prefix, boost values
- `SearchEditor.test.ts` — Component tests:
  - Renders an editable text input
  - Accepts typed text and reflects it in the DOM
  - On form submission, emits the serialized query string

**Result**: A search field where users can type raw queries and submit them. No chips yet, no autocomplete — but the schema supports structured nodes and they serialize correctly. Parser gaps are documented.

### Phase 2: Decoration Plugin

Add visual styling for operators and grouping without touching the schema.

- Implement the decoration plugin that matches `AND`/`OR`/`NOT`, `()`, and `+`/`-` prefixes
- Style decorations with CSS (subtle backgrounds, monospace for operators)
- Optional: matching parenthesis highlighting on cursor proximity

**Tests (write first):**
- `SearchEditor.test.ts` — Component tests for decoration rendering:
  - Type `mueller AND report` → `AND` is wrapped in an element with the operator decoration class
  - Type `(foo OR bar)` → `OR` gets operator class, `(` and `)` get grouping class
  - Type `and` (lowercase) → no decoration applied (operators must be uppercase)
  - Type `ANDY` → no decoration (must be whole word match)
  - Delete `AND` character by character → decoration removed as soon as it's no longer a complete match

**Result**: Typing `mueller AND (report OR memo)` shows operators and parens with visual distinction.

### Phase 3: NodeViews

Render atomic nodes as interactive chips.

- Build Svelte NodeView for `field-value` nodes (displays field label + value, with loading indicator while `displayValue` is being fetched)
- Build Svelte NodeView for `range` nodes (displays human-readable range)
- Build Svelte NodeView for `sort` nodes (displays sort field + direction arrow)
- Handle chip selection, deletion (backspace), and cursor navigation around chips

**Tests (write first):**
- `FieldValueChip.test.ts` — NodeView component tests:
  - Renders field label and value text (e.g., "User: 102112")
  - Shows display value when available (e.g., "User: Mitchell Kotler")
  - Shows loading indicator when `displayValue` is not yet set for entity fields
  - Shows prefix indicator for `+` (required) and `-` (excluded)
  - Renders boost badge when boost is set
- `RangeChip.test.ts`:
  - Renders field and bounds (e.g., "Created: NOW-1MONTH to *")
  - Distinguishes inclusive `[]` vs exclusive `{}` visually
- `SortChip.test.ts`:
  - Renders field name and direction arrow
- `SearchEditor.test.ts` — Integration tests for chip behavior in the editor:
  - Programmatically insert a `field-value` node → chip appears in DOM
  - Arrow keys navigate cursor around chips (before/after)
  - Backspace adjacent to a chip selects it; second backspace deletes it

**Result**: If a structured node exists in the document (inserted programmatically for now), it renders as a chip.

### Phase 4: Deserialization & Clipboard

Load existing queries into the editor. This comes before autocomplete so that copy/paste workflows are available for early manual testing.

- Implement `deserialize()` using the `lucene` npm package (informed by Phase 1 parser evaluation)
- Handle URL query params → editor population on page load
- Implement paste interception — always deserialize pasted text (decorations on operators are truthful signals of Solr interpretation)
- Implement copy serialization (selection → clipboard as Lucene string)
- Async display name enrichment after deserialization (raw value + loading indicator → pretty value)

**Undo/redo:** Default ProseMirror history behavior applies. Undoing a chip insertion (from paste or autocomplete) restores the original text without reopening any UI.

**Tests (write first):**
- `deserialize.test.ts` — Pure function tests:
  - `+user:102112` → doc with `field-value` node `{ field: "user", value: "102112", prefix: "+" }`
  - `"steve jobs" macintosh` → doc with plain text
  - `mueller AND report` → doc with text nodes (operators stay as text)
  - `created_at:[NOW-1MONTH TO *]` → doc with `range` node
  - `sort:-page_count` → doc with `sort` node `{ field: "page_count", direction: "desc" }`
  - `+user:102112 AND access:private report` → mixed doc with two `field-value` nodes and text
  - `title:Mueller*` → plain text (not chipped)
  - `data_Folder:"test"` → plain text (not chipped)
  - Invalid/malformed queries → fall back to plain text
- `nodeviews.test.ts` — Entity enrichment through NodeViews:
  - Insert a `field-value` node with no `displayValue` → chip shows raw value + loading indicator
  - Dispatch a transaction updating the node's `displayValue` attr → chip re-renders with display name, loading indicator removed
  - Multiple concurrent enrichment transactions (e.g., two user chips) → both chips update independently
- `SearchEditor.test.ts` — Component tests for load, paste, and copy:
  - Render editor with initial query prop → editor populated with chips and text
  - Paste `+user:102112 AND access:private` → chips and decorated `AND` appear
  - Paste normal prose containing `NOT` → `NOT` gets decorated (truthful)
  - Select a chip and plain text, copy → clipboard contains serialized Lucene string
  - Copy entire editor contents → clipboard matches what `serialize()` would produce
  - Round-trip: serialize → deserialize → serialize produces the same string

**Result**: Navigating to `?q=+user:102112+AND+access:private` populates the editor with chips. Copy/paste round-trips work.

### Phase 5: Autocomplete

Guide users through field and value selection.

- Build the autocomplete plugin with two-stage flow (field → value)
- Implement static value suggestions (access, status, language)
- Implement the suggestion dropdown UI (positioned with Floating UI)
- Handle keyboard navigation (arrow keys, Enter/Tab, Escape)
- Insert `field-value` nodes on selection
- Build with accessibility from the start: `role="listbox"`, `role="option"`, `aria-activedescendant`, `aria-expanded`, `aria-autocomplete="list"`, `aria-live` region for suggestion count

**Tests (write first):**
- `autocomplete.test.ts` — Plugin logic tests:
  - Typing `us` returns suggestions containing `user`
  - Typing `acc` returns `access`
  - Typing `titl` returns `title` (plain-text fields included for discoverability)
  - Selecting `access` transitions to value stage with `public`, `organization`, `private`
  - Selecting `title` inserts `title:` as text (no value stage)
  - Suggestion list filters as user types more characters
- `SearchEditor.test.ts` — Component integration tests:
  - Type `us` → dropdown appears with `user` suggestion
  - Dropdown has `role="listbox"`; suggestions have `role="option"`
  - `aria-activedescendant` updates as ArrowDown/ArrowUp changes selection
  - `aria-expanded` is `true` when dropdown is open, `false` when dismissed
  - Press Enter → suggestion accepted, chip inserted (for chippable fields)
  - Press Escape → dropdown dismissed
  - Select `user` → value stage shows; select a value → `field-value` node inserted with space after
  - Select `title` → `title:` inserted as text, cursor after colon, no value dropdown

**Result**: Users can type `us` → see `user` suggested → select it → search for users → select a user → chip inserted. Dropdown is fully keyboard- and screen-reader-accessible.

### Phase 6: API Integration

Connect value suggestions to live data.

- Wire up user search for the `user` field autocomplete
- Wire up organization search for the `organization` field
- Wire up project search for the `project` field
- Wire up document search by title for the `document` field (resolves to document ID)
- Fetch and cache display names for enriching chips after deserialization

**Tests (write first):**
- `autocomplete.test.ts` — Tests with mocked API responses:
  - Select `user` field → type "mitchell" → mock API returns user results → suggestions shown with display names
  - Select a user → `field-value` node created with `value: "mitchell-kotler-1"` and `displayValue: "Mitchell Kotler"`
  - Select `document` field → type title text → mock API returns document results → suggestions shown with document titles
  - Select a document → `field-value` node created with `value: "20059100"` and `displayValue: "The Mueller Report"`
  - API error → graceful fallback (no suggestions or error message, not a crash)
  - Debouncing: rapid typing only triggers one API call after settling
- `SearchEditor.test.ts` — End-to-end component tests:
  - Full flow: type `us` → select `user` → type name → select from API results → chip rendered with display name
  - Same flow for `organization`, `project`, and `document`

**Result**: Full interactive experience for entity-based fields.

### Phase 7: Refinements

Polish the experience.

- Range builder UI for date and numeric fields
- Date math shortcuts in autocomplete (`Last month`, `Last year`, etc.)
- Click-to-edit on chips
- Keyboard accessibility audit (verify baseline ARIA from Phase 5, add chip-level announcements)
- Mobile/touch considerations

**Tests (write first):**
- Range builder: selecting `created_at` → date shortcut suggestions shown → selecting "Last month" inserts range node with `NOW-1MONTH TO *`
- Click-to-edit: click a chip → value picker reopens → change value → chip updates
- Accessibility: chips are announced by screen readers; keyboard-only users can navigate, select, and delete chips

## Future Work

Features that depend on backend changes or are otherwise deferred from the initial implementation.

### `data_*` Field Suggestions

Currently, `data_*` fields (arbitrary key/value metadata on documents) are handled as plain text. To chip these, we need:

1. **API endpoint for data keys**: A new endpoint (or addition to an existing one) that returns the set of `data_*` keys present across a user's documents (or within a project/organization scope). This would power the autocomplete for key names after the user types `data_`.
2. **API endpoint for data values**: Given a key, return known values for that key. This would power the value stage of autocomplete for `data_*` fields.
3. **NodeView for data chips**: Once API support exists, `data_*` fields can be promoted to `field-value` nodes with display values derived from the key name (e.g., `data_Folder` → `Folder: Environmental docs`).

Until these APIs exist, `data_*` fields are fully functional as plain text — they serialize correctly and the search works. The chip experience is additive.

### Field Alias Normalization

Field aliases (`account` → `user`, `group` → `organization`, `projects` → `project`, `id` → `document`, `pages` → `page_count`, `doctext` → `text`) are currently not normalized during deserialization. A future enhancement could normalize aliases to their canonical field names so that chips and serialization are consistent regardless of which alias the user typed or pasted.

### Search Selected Documents

A workflow enhancement where users can select documents from search results and then "search within these documents" — prefilling the search field with `document:` chips for each selected document ID. This depends on a multi-select UI in the document list.

## Known Issues

### Autocomplete doesn't activate when typing after a chip with one space

When the cursor is positioned after `[chip] ` (one space) and the user types a field name prefix like `acc`, the autocomplete dropdown does not appear. It works correctly with two spaces after the chip, or when there are no chips before the cursor.

**Root cause (suspected):** `doc.textBetween()` uses a `leafText` parameter to represent inline atom nodes (chips) as text. The interaction between the atom's leaf-text space and the typed space may be collapsing into a single space, causing the word boundary detection in `detectTrigger()` to fail.

**Workaround:** Users can use `Cmd+/` to manually open the field list, or type two spaces after a chip.

### Phase 5 autocomplete test coverage gaps

The following autocomplete behaviors work end-to-end but lack dedicated integration tests:

- Full insertion flow: type field prefix → select field → select value → verify chip appears in document with correct attributes
- `Cmd+/` shortcut opening the full field list and keyboard selection from it
