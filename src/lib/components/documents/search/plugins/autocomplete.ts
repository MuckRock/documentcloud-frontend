import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { computePosition, flip, offset, shift } from "@floating-ui/dom";

// Autocomplete plugin key for external access
export const autocompletePluginKey = new PluginKey("autocomplete");

// List of valid fields for autocomplete suggestions
const validFieldSuggestions = [
  "id",
  "document",
  "access",
  "created_at",
  "tag",
  "description",
  "language",
  "organization",
  "group",
  "page_count",
  "pages",
  "project",
  "projects",
  "slug",
  "source",
  "status",
  "title",
  "updated_at",
  "user",
  "account",
  "doctext",
  "text",
  "sort",
  "order",
];

// Special field format that needs dynamic handling
const DATA_FIELD_REGEX = /^data_[a-zA-Z0-9_-]+$/;

// Define the autocomplete state structure
interface AutocompleteState {
  active: boolean;
  stage: 'field' | 'value'; // Track whether we're suggesting fields or values
  fieldType: string | null; // For value stage, which field are we completing
  start: number | null;
  end: number | null;
  text: string;
  suggestions: Suggestion[];
  selectedIndex: number;
}

// Suggestion can be either a field name or a field value
interface Suggestion {
  type: 'field' | 'value';
  display: string; // What to show in dropdown
  value: string; // What to insert
  field?: string; // For value suggestions, which field this is for
  meta?: any; // Additional metadata (for future rich display)
}

// Get field name suggestions
function getFieldSuggestions(text: string): Suggestion[] {
  if (!text) return [];

  return validFieldSuggestions
    .filter((field) => field.toLowerCase().startsWith(text.toLowerCase()))
    .map((field) => ({
      type: 'field' as const,
      display: field,
      value: field,
    }));
}

// Get value suggestions for a specific field
function getValueSuggestions(fieldType: string, text: string): Suggestion[] {
  // Static value suggestions for known fields
  const staticValues: Record<string, string[]> = {
    access: ['public', 'private', 'organization'],
    status: ['success', 'readable', 'pending', 'error', 'nofile'],
    language: ['eng', 'spa', 'fra', 'deu', 'ita', 'por', 'rus', 'zho', 'jpn', 'ara'],
  };

  const values = staticValues[fieldType];
  if (values) {
    return values
      .filter((value) => value.toLowerCase().startsWith(text.toLowerCase()))
      .map((value) => ({
        type: 'value' as const,
        display: value,
        value: value,
        field: fieldType,
      }));
  }

  // For API-based fields (user, organization, project), return empty for now
  // We'll implement API calls in the next step
  if (['user', 'account', 'organization', 'group', 'project'].includes(fieldType)) {
    // TODO: Fetch from API
    return [];
  }

  return [];
}

// Helper to create the dropdown element
function createDropdownElement(): HTMLElement {
  const dropdown = document.createElement("div");
  dropdown.className = "search-autocomplete";
  dropdown.style.position = "absolute";
  dropdown.style.zIndex = "10";
  dropdown.style.backgroundColor = "white";
  dropdown.style.border = "1px solid #ddd";
  dropdown.style.borderRadius = "4px";
  dropdown.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
  dropdown.style.overflow = "hidden";
  dropdown.style.display = "none";
  return dropdown;
}

// Detect if we should activate autocomplete based on current cursor position
function shouldActivateAutocomplete(view: EditorView): {
  active: boolean;
  stage: 'field' | 'value';
  fieldType: string | null;
  start: number | null;
  end: number | null;
  text: string;
} {
  try {
    const { doc, selection } = view.state;
    const { from, to } = selection;

    // Only activate when cursor is at a single position (not a selection range)
    if (from !== to) {
      return { active: false, stage: 'field', fieldType: null, start: null, end: null, text: "" };
    }

    // Bounds check
    if (from < 0 || from > doc.content.size) {
      return { active: false, stage: 'field', fieldType: null, start: null, end: null, text: "" };
    }

    const $pos = doc.resolve(from);

    // Only activate in paragraphs (not inside term/range/operator nodes)
    if ($pos.parent.type.name !== "paragraph") {
      return { active: false, stage: 'field', fieldType: null, start: null, end: null, text: "" };
    }

    // STAGE 2: Check if we're right after a term node (for value autocomplete)
    // This happens when user selects a field and we insert "field:" - cursor is right after
    const nodeBefore = $pos.nodeBefore;
    if (nodeBefore && nodeBefore.type.name === 'term') {
      const field = nodeBefore.attrs.field;
      const value = nodeBefore.attrs.value;

      // If term has a field but value is empty or "VALUE", activate value autocomplete
      if (field && (!value || value === "VALUE")) {
        // We'll treat this as typing an empty value, positioned right after the term
        return {
          active: true,
          stage: 'value',
          fieldType: field,
          start: from,
          end: from,
          text: "",
        };
      }
    }

    // Don't activate if we're inside other structured nodes (range, operator)
    if (nodeBefore && !nodeBefore.isText && nodeBefore.type.name !== 'term') {
      return { active: false, stage: 'field', fieldType: null, start: null, end: null, text: "" };
    }

    // Extract text before cursor to find what the user is typing
    let textBefore = "";
    let wordStart = from;
    const node = $pos.parent;

    // Only look at text nodes in the current paragraph
    if (node.type.name === "paragraph") {
      // Get all text content from start of paragraph to cursor position
      const textBeforeCursor = doc.textBetween($pos.start(), from, " ");

      if (textBeforeCursor.length > 0) {
        // Work backwards from end to find word start
        let i = textBeforeCursor.length;
        let wordStartOffset = i;

        while (wordStartOffset > 0 && /[a-zA-Z0-9_-]/.test(textBeforeCursor.charAt(wordStartOffset - 1))) {
          wordStartOffset--;
        }

        // Extract the current word being typed
        textBefore = textBeforeCursor.slice(wordStartOffset);
        wordStart = from - (i - wordStartOffset);

        // Only activate if typing what looks like a field name
        // Minimum 1 character to avoid activating on every keystroke
        if (textBefore.length > 0 && /^[a-zA-Z0-9_-]+$/.test(textBefore)) {
          return {
            active: true,
            stage: 'field',
            fieldType: null,
            start: wordStart,
            end: from,
            text: textBefore,
          };
        }
      }
    }

    return { active: false, stage: 'field', fieldType: null, start: null, end: null, text: "" };
  } catch (error) {
    // If anything goes wrong, just deactivate autocomplete
    console.error("Error in shouldActivateAutocomplete:", error);
    return { active: false, stage: 'field', fieldType: null, start: null, end: null, text: "" };
  }
}

export const autocompletePlugin = new Plugin<AutocompleteState>({
  key: autocompletePluginKey,
  state: {
    init(): AutocompleteState {
      return {
        active: false,
        stage: 'field',
        fieldType: null,
        start: null,
        end: null,
        text: "",
        suggestions: [],
        selectedIndex: 0,
      };
    },
    apply(tr, state) {
      // If there's a meta field for autocomplete, use that
      const meta = tr.getMeta(autocompletePluginKey);
      if (meta) {
        return { ...state, ...meta };
      }

      // CRITICAL: Preserve autocomplete state during queryTrackingPlugin rebuilds
      // The "rebuild" meta flag indicates a document rebuild, not a user edit
      if (tr.getMeta("rebuild")) {
        // Adjust positions if they're set, since document structure changed
        if (state.active && state.start !== null && state.end !== null) {
          // Map positions through the transaction
          const newStart = tr.mapping.map(state.start);
          const newEnd = tr.mapping.map(state.end);
          return {
            ...state,
            start: newStart,
            end: newEnd,
          };
        }
        return state;
      }

      // If the document changed by user action, deactivate autocomplete
      if (tr.docChanged) {
        return {
          active: false,
          stage: 'field',
          fieldType: null,
          start: null,
          end: null,
          text: "",
          suggestions: [],
          selectedIndex: 0,
        };
      }

      // If selection changed, deactivate (view plugin will recompute)
      if (tr.selectionSet && !tr.getMeta("autocomplete-selection-update")) {
        return {
          active: false,
          stage: 'field',
          fieldType: null,
          start: null,
          end: null,
          text: "",
          suggestions: [],
          selectedIndex: 0,
        };
      }

      return state;
    },
  },
  props: {
    // Handle key presses for navigation and selection
    handleKeyDown(view, event) {
      const state = this.getState(view.state);

      // If not active, let other handlers take it
      if (!state?.active || state.suggestions.length === 0) {
        return false;
      }

      // Handle navigation keys
      switch (event.key) {
        case "ArrowDown":
          // Move selection down
          view.dispatch(
            view.state.tr
              .setMeta(autocompletePluginKey, {
                ...state,
                selectedIndex:
                  (state.selectedIndex + 1) % state.suggestions.length,
              })
              .setMeta("autocomplete-selection-update", true),
          );
          return true;

        case "ArrowUp":
          // Move selection up
          view.dispatch(
            view.state.tr
              .setMeta(autocompletePluginKey, {
                ...state,
                selectedIndex:
                  (state.selectedIndex + state.suggestions.length - 1) %
                  state.suggestions.length,
              })
              .setMeta("autocomplete-selection-update", true),
          );
          return true;

        case "Enter":
        case "Tab":
          // Apply the selected suggestion
          if (state.start !== null && state.end !== null && state.suggestions.length > 0) {
            const tr = view.state.tr;
            const selectedSuggestion = state.suggestions[state.selectedIndex];

            if (selectedSuggestion.type === 'field') {
              // FIELD SELECTION: Insert term node with empty value
              tr.delete(state.start, state.end);

              const termNode = view.state.schema.nodes.term?.create({
                value: "",
                field: selectedSuggestion.value,
                quoted: false,
              });
              if (termNode) tr.insert(state.start, termNode);

              // Mark this as an autocomplete intermediate step to prevent rebuild
              tr.setMeta("autocomplete-intermediate", true);

              // Don't close autocomplete - it will reactivate for value stage
              view.dispatch(tr);
            } else {
              // VALUE SELECTION: Update the term node before cursor
              const $pos = view.state.doc.resolve(state.start);
              const nodeBefore = $pos.nodeBefore;

              if (nodeBefore && nodeBefore.type.name === 'term') {
                const nodeStart = state.start - nodeBefore.nodeSize;
                tr.delete(nodeStart, state.start);

                const updatedTermNode = view.state.schema.nodes.term?.create({
                  value: selectedSuggestion.value,
                  field: nodeBefore.attrs.field,
                  quoted: false,
                  boost: nodeBefore.attrs.boost,
                  prefix: nodeBefore.attrs.prefix,
                });
                if (updatedTermNode) {
                  tr.insert(nodeStart, updatedTermNode);
                  // Add a space with implicitOperator mark after the term
                  const afterTerm = nodeStart + updatedTermNode.nodeSize;
                  const schema = view.state.schema;
                  const spaceWithMark = schema.text(" ", [schema.marks.implicitOperator.create()]);
                  tr.insert(afterTerm, spaceWithMark);
                  // Position cursor after the space
                  const afterSpace = afterTerm + spaceWithMark.nodeSize;
                  tr.setSelection(TextSelection.create(tr.doc, afterSpace));
                  // Remove any stored marks to prevent them from affecting the space
                  tr.setStoredMarks([]);

                  console.log('[Autocomplete] After value insertion - doc:', JSON.stringify(tr.doc.toJSON(), null, 2));
                  console.log('[Autocomplete] Cursor position:', afterSpace);
                  console.log('[Autocomplete] Stored marks:', tr.storedMarks);
                }

                // Close autocomplete after value selection
                tr.setMeta(autocompletePluginKey, {
                  active: false,
                  stage: 'field',
                  fieldType: null,
                  start: null,
                  end: null,
                  text: "",
                  suggestions: [],
                  selectedIndex: 0,
                });

                // Skip rebuild to preserve document structure
                tr.setMeta("autocomplete-intermediate", true);

                view.dispatch(tr);
              }
            }
          }

          // Prevent default Enter behavior (newline insertion)
          event.preventDefault();
          event.stopPropagation();
          return true;

        case "Escape":
          // Close the autocomplete
          view.dispatch(
            view.state.tr.setMeta(autocompletePluginKey, {
              active: false,
              stage: 'field',
              fieldType: null,
              start: null,
              end: null,
              text: "",
              suggestions: [],
              selectedIndex: 0,
            }),
          );
          event.preventDefault();
          return true;
      }

      return false;
    },
  },
  // View plugin to handle DOM manipulation
  view(editorView) {
    // Create the dropdown element
    let dropdown: HTMLElement | null = createDropdownElement();
    document.body.appendChild(dropdown);

    // Function to update the dropdown position
    function updateDropdownPosition() {
      if (!dropdown) return;

      const state = autocompletePluginKey.getState(editorView.state);
      if (!state.active || state.end === null) {
        dropdown.style.display = "none";
        return;
      }

      // Get coordinates of cursor position
      const coords = editorView.coordsAtPos(state.end);

      // Create a virtual element at the cursor position
      const virtualElement = {
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: coords.left,
            y: coords.bottom,
            top: coords.bottom,
            right: coords.left,
            bottom: coords.bottom,
            left: coords.left,
          };
        },
      };

      // Position the dropdown below the cursor using floating-ui
      computePosition(virtualElement, dropdown, {
        placement: "bottom-start",
        middleware: [
          offset(6), // Add some space
          flip(), // Flip to top if no space below
          shift(), // Shift horizontally if needed
        ],
      }).then(({ x, y }) => {
        dropdown!.style.left = `${x}px`;
        dropdown!.style.top = `${y}px`;
      });
    }

    // Function to render suggestions
    function renderSuggestions(suggestions: Suggestion[], selectedIndex: number) {
      if (!dropdown) return;

      // Clear existing content
      dropdown.innerHTML = "";

      if (suggestions.length === 0) {
        dropdown.style.display = "none";
        return;
      }

      // Create a list for suggestions
      const list = document.createElement("ul");
      list.style.margin = "0";
      list.style.padding = "0";
      list.style.listStyle = "none";

      // Add each suggestion as a list item
      suggestions.forEach((suggestion, index) => {
        const item = document.createElement("li");
        item.textContent = suggestion.display;
        item.style.padding = "6px 12px";
        item.style.cursor = "pointer";

        // Highlight the selected item
        if (index === selectedIndex) {
          item.style.backgroundColor = "#e6f7ff";
        }

        // Add event listeners
        // Use mousedown instead of click to fire before editor blur event
        item.addEventListener("mousedown", (event) => {
          event.preventDefault();
          event.stopPropagation();

          // Apply this suggestion
          const state = autocompletePluginKey.getState(editorView.state);
          if (state.start !== null && state.end !== null) {
            const tr = editorView.state.tr;

            if (suggestion.type === 'field') {
              // FIELD SELECTION: Insert term node with empty value
              // Delete the partial text
              tr.delete(state.start, state.end);

              // Insert the term node with the field and empty value
              const termNode = editorView.state.schema.nodes.term?.create({
                value: "",
                field: suggestion.value,
                quoted: false,
              });
              if (termNode) tr.insert(state.start, termNode);

              // Mark this as an autocomplete intermediate step to prevent rebuild
              tr.setMeta("autocomplete-intermediate", true);

              // Don't close autocomplete - it will reactivate for value stage
              editorView.dispatch(tr);
              editorView.focus();
            } else {
              // VALUE SELECTION: Update the term node before cursor
              const $pos = editorView.state.doc.resolve(state.start);
              const nodeBefore = $pos.nodeBefore;

              if (nodeBefore && nodeBefore.type.name === 'term') {
                // Replace the term node with updated value
                const nodeStart = state.start - nodeBefore.nodeSize;
                tr.delete(nodeStart, state.start);

                const updatedTermNode = editorView.state.schema.nodes.term?.create({
                  value: suggestion.value,
                  field: nodeBefore.attrs.field,
                  quoted: false,
                  boost: nodeBefore.attrs.boost,
                  prefix: nodeBefore.attrs.prefix,
                });
                if (updatedTermNode) {
                  tr.insert(nodeStart, updatedTermNode);
                  // Add a space with implicitOperator mark after the term
                  const afterTerm = nodeStart + updatedTermNode.nodeSize;
                  const schema = view.state.schema;
                  const spaceWithMark = schema.text(" ", [schema.marks.implicitOperator.create()]);
                  tr.insert(afterTerm, spaceWithMark);
                  // Set selection to position after the space, with implicitTerm mark active
                  // This ensures the next text typed will have implicitTerm mark
                  const afterSpace = afterTerm + spaceWithMark.nodeSize;
                  tr.setSelection(TextSelection.create(tr.doc, afterSpace));
                  tr.setStoredMarks([schema.marks.implicitTerm.create()]);
                }

                // Close autocomplete after value selection
                tr.setMeta(autocompletePluginKey, {
                  active: false,
                  stage: 'field',
                  fieldType: null,
                  start: null,
                  end: null,
                  text: "",
                  suggestions: [],
                  selectedIndex: 0,
                });

                // Skip rebuild to preserve document structure
                tr.setMeta("autocomplete-intermediate", true);

                editorView.dispatch(tr);
                editorView.focus();
              }
            }
          }
        });

        item.addEventListener("mouseenter", () => {
          // Update selected index on hover
          const state = autocompletePluginKey.getState(editorView.state);
          editorView.dispatch(
            editorView.state.tr.setMeta(autocompletePluginKey, {
              ...state,
              selectedIndex: index,
            }),
          );
        });

        list.appendChild(item);
      });

      dropdown.appendChild(list);
      dropdown.style.display = "block";
    }

    return {
      update(view, prevState) {
        // Check if we should activate autocomplete based on current editor state
        const { active, stage, fieldType, start, end, text } = shouldActivateAutocomplete(view);

        // Get the current plugin state
        const currentState = autocompletePluginKey.getState(view.state);

        // Flag to track if we dispatched a transaction
        let dispatched = false;

        // If we need to activate or update suggestions
        if (active) {
          // Get suggestions based on stage
          const suggestions = stage === 'field'
            ? getFieldSuggestions(text)
            : getValueSuggestions(fieldType || '', text);

          // Only dispatch a transaction if the computed state differs from stored state
          if (
            !currentState.active ||
            currentState.stage !== stage ||
            currentState.fieldType !== fieldType ||
            currentState.text !== text ||
            currentState.start !== start ||
            currentState.end !== end
          ) {
            // Dispatch transaction to update plugin state
            // Don't render here - let the next update cycle handle it
            view.dispatch(
              view.state.tr.setMeta(autocompletePluginKey, {
                active,
                stage,
                fieldType,
                start,
                end,
                text,
                suggestions,
                selectedIndex: 0,
              }),
            );
            dispatched = true;
          }
        }
        // If should deactivate
        else if (currentState.active && !active) {
          // Deactivate if currently active
          view.dispatch(
            view.state.tr.setMeta(autocompletePluginKey, {
              active: false,
              stage: 'field',
              fieldType: null,
              start: null,
              end: null,
              text: "",
              suggestions: [],
              selectedIndex: 0,
            }),
          );
          dispatched = true;
        }

        // Only render if we didn't dispatch (to avoid double-render)
        // If we dispatched, the next update cycle will handle rendering
        if (!dispatched) {
          const pluginState = autocompletePluginKey.getState(view.state);
          if (pluginState.active) {
            renderSuggestions(pluginState.suggestions, pluginState.selectedIndex);
            updateDropdownPosition();
          } else {
            dropdown!.style.display = "none";
          }
        }
      },

      destroy() {
        // Clean up the dropdown when editor is destroyed
        if (dropdown && dropdown.parentNode) {
          dropdown.parentNode.removeChild(dropdown);
        }
        dropdown = null;
      },
    };
  },
});
