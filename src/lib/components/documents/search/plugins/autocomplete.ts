import { EditorState, Plugin, PluginKey, Transaction } from "prosemirror-state";
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
  start: number | null;
  end: number | null;
  text: string;
  suggestions: string[];
  selectedIndex: number;
}

// Get filtered suggestions based on user input
function getSuggestions(text: string): string[] {
  if (!text) return [];

  // Filter suggestions that match the typed text
  return validFieldSuggestions.filter((field) =>
    field.toLowerCase().startsWith(text.toLowerCase()),
  );
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
  start: number | null;
  end: number | null;
  text: string;
} {
  const { doc, selection } = view.state;
  const { from, to } = selection;

  // Only activate when cursor is at a single position (not a selection range)
  if (from !== to) {
    return { active: false, start: null, end: null, text: "" };
  }

  // Check if we're in plain text or at the start of a node
  // Get the position of the start of the current token
  let start = from;
  let $pos = doc.resolve(from);

  // If we're at the start of the document or at a non-text node, don't activate
  if ($pos.parent.type.name !== "paragraph") {
    return { active: false, start: null, end: null, text: "" };
  }

  // Extract text before cursor to find what the user is typing
  // We need to find the beginning of the current "token"
  let textBefore = "";
  let node = $pos.parent;

  // Only look at text nodes in the current paragraph
  if (node.type.name === "paragraph") {
    // Find the position of the start of the word
    let wordStart = from;
    let i = $pos.textOffset;

    // If we're in a text node
    if ($pos.nodeAfter?.isText || $pos.nodeBefore?.isText) {
      // Get text content around cursor
      let slice = doc.slice($pos.start(), $pos.end());
      let text = slice.content.textBetween(0, slice.content.size, " ");

      // Work backwards from cursor to find word start
      while (i > 0 && /[a-zA-Z0-9_-]/.test(text.charAt(i - 1))) {
        i--;
        wordStart--;
      }

      // Extract the text being typed
      textBefore = text.slice(i, $pos.textOffset);

      // Only activate if typing what looks like a field name
      if (textBefore.length > 0 && /^[a-zA-Z0-9_-]+$/.test(textBefore)) {
        return {
          active: true,
          start: wordStart,
          end: from,
          text: textBefore,
        };
      }
    }
  }

  return { active: false, start: null, end: null, text: "" };
}

export const autocompletePlugin = new Plugin<AutocompleteState>({
  key: autocompletePluginKey,
  state: {
    init(): AutocompleteState {
      return {
        active: false,
        start: null,
        end: null,
        text: "",
        suggestions: [],
        selectedIndex: 0,
      };
    },
    apply(tr, state) {
      // Always get a fresh state when the document changes
      const newState = { ...state };

      // If there's a meta field for autocomplete, use that
      const meta = tr.getMeta(autocompletePluginKey);
      if (meta) {
        return { ...newState, ...meta };
      }

      // If the document changed, we need to recompute
      if (tr.docChanged) {
        // Deactivate for now, the view plugin will recompute
        return {
          active: false,
          start: null,
          end: null,
          text: "",
          suggestions: [],
          selectedIndex: 0,
        };
      }

      // If selection changed, need to recheck
      if (tr.selectionSet) {
        return {
          active: false,
          start: null,
          end: null,
          text: "",
          suggestions: [],
          selectedIndex: 0,
        };
      }

      return newState;
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
            view.state.tr.setMeta(autocompletePluginKey, {
              ...state,
              selectedIndex:
                (state.selectedIndex + 1) % state.suggestions.length,
            }),
          );
          return true;

        case "ArrowUp":
          // Move selection up
          view.dispatch(
            view.state.tr.setMeta(autocompletePluginKey, {
              ...state,
              selectedIndex:
                (state.selectedIndex + state.suggestions.length - 1) %
                state.suggestions.length,
            }),
          );
          return true;

        case "Enter":
        case "Tab":
          // Apply the selected suggestion
          if (state.start !== null && state.end !== null) {
            // Create transaction to replace text with field
            const tr = view.state.tr;
            const selectedSuggestion = state.suggestions[state.selectedIndex];

            // Delete the partial text
            tr.delete(state.start, state.end);

            // Insert the term node with the field
            const termNode = view.state.schema.nodes.term?.create({
              value: "VALUE",
              field: selectedSuggestion,
              quoted: false,
            });
            if (termNode) tr.insert(state.start, termNode);

            // Close the autocomplete
            tr.setMeta(autocompletePluginKey, {
              active: false,
              start: null,
              end: null,
              text: "",
              suggestions: [],
              selectedIndex: 0,
            });

            view.dispatch(tr);
          }

          event.preventDefault();
          return true;

        case "Escape":
          // Close the autocomplete
          view.dispatch(
            view.state.tr.setMeta(autocompletePluginKey, {
              active: false,
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
    function renderSuggestions(suggestions: string[], selectedIndex: number) {
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
        item.textContent = suggestion;
        item.style.padding = "6px 12px";
        item.style.cursor = "pointer";

        // Highlight the selected item
        if (index === selectedIndex) {
          item.style.backgroundColor = "#e6f7ff";
        }

        // Add event listeners
        item.addEventListener("click", () => {
          // Apply this suggestion
          const state = autocompletePluginKey.getState(editorView.state);
          if (state.start !== null && state.end !== null) {
            // Create transaction to replace text with field
            const tr = editorView.state.tr;

            // Delete the partial text
            tr.delete(state.start, state.end);

            // Insert the term node with the field
            const termNode = editorView.state.schema.nodes.term?.create({
              value: "VALUE",
              field: suggestion,
              quoted: false,
            });
            if (termNode) tr.insert(state.start, termNode);

            // Close the autocomplete
            tr.setMeta(autocompletePluginKey, {
              active: false,
              start: null,
              end: null,
              text: "",
              suggestions: [],
              selectedIndex: 0,
            });

            editorView.dispatch(tr);
            editorView.focus();
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
      update(view) {
        // Check if we should activate autocomplete
        const { active, start, end, text } = shouldActivateAutocomplete(view);

        // Get the current plugin state
        const currentState = autocompletePluginKey.getState(view.state);

        // If we need to activate or update suggestions
        if (active && text) {
          const suggestions = getSuggestions(text);

          // Only update the state if there's a change
          if (
            !currentState.active ||
            currentState.text !== text ||
            currentState.start !== start ||
            currentState.end !== end
          ) {
            // Dispatch transaction to update plugin state
            view.dispatch(
              view.state.tr.setMeta(autocompletePluginKey, {
                active,
                start,
                end,
                text,
                suggestions,
                selectedIndex: 0,
              }),
            );
          } else {
            // If already active with same text, just render
            renderSuggestions(suggestions, currentState.selectedIndex);
            updateDropdownPosition();
          }
        }
        // If should deactivate
        else if (currentState.active && (!active || !text)) {
          // Deactivate if currently active
          view.dispatch(
            view.state.tr.setMeta(autocompletePluginKey, {
              active: false,
              start: null,
              end: null,
              text: "",
              suggestions: [],
              selectedIndex: 0,
            }),
          );
        }

        // Always update the dropdown based on current state
        const pluginState = autocompletePluginKey.getState(view.state);
        if (pluginState.active) {
          renderSuggestions(pluginState.suggestions, pluginState.selectedIndex);
          updateDropdownPosition();
        } else {
          dropdown!.style.display = "none";
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
