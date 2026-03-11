import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import {
  getAllFieldSuggestions,
  getFieldSuggestions,
  getValueSuggestions,
  detectTrigger,
  resolveField,
  isAsyncField,
  fetchValueSuggestions,
  getRangeConfig,
  type Suggestion,
} from "../autocomplete-data";
import { searchSchema } from "../schema";
import AutocompleteDropdown from "../AutocompleteDropdown.svelte";
import RangeBuilder from "../RangeBuilder.svelte";

export const autocompletePluginKey = new PluginKey("autocomplete");

// ── State ──────────────────────────────────────────────────────

interface AutocompleteState {
  active: boolean;
  /** Explicitly dismissed (Escape / click-away). Prevents re-activation
   *  until the next doc change resets the flag. */
  dismissed: boolean;
  /** True while waiting for API results for an async field. */
  loading: boolean;
  stage: "field" | "value" | "range";
  /** For value stage: the canonical field name. */
  fieldName: string | null;
  /** PM position: start of the text to replace on acceptance. */
  from: number | null;
  /** PM position: end of the text to replace. */
  to: number | null;
  /** Current filter text (what the user has typed). */
  filterText: string;
  suggestions: Suggestion[];
  selectedIndex: number;
}

const INACTIVE: AutocompleteState = {
  active: false,
  dismissed: false,
  loading: false,
  stage: "field",
  fieldName: null,
  from: null,
  to: null,
  filterText: "",
  suggestions: [],
  selectedIndex: 0,
};

const DISMISSED: AutocompleteState = {
  ...INACTIVE,
  dismissed: true,
};

// ── Trigger detection (from PM state) ──────────────────────────

/**
 * Examine the text before the cursor and determine if autocomplete should
 * be active. Returns a new AutocompleteState or null if inactive.
 */
function computeAutocompleteState(
  view: EditorView,
  preloadedFields?: Set<string>,
): AutocompleteState | null {
  const { doc, selection } = view.state;
  const { from, to } = selection;

  // Only for collapsed cursors in text
  if (from !== to) return null;
  if (from < 1 || from > doc.content.size) return null;

  const $pos = doc.resolve(from);
  if ($pos.parent.type.name !== "paragraph") return null;

  // Get text from start of paragraph to cursor.
  // Use space as the leaf-text separator so atom nodes (chips) produce a
  // space boundary, keeping word detection correct.
  const textBeforeCursor = doc.textBetween($pos.start(), from, " ", " ");

  const trigger = detectTrigger(textBeforeCursor, preloadedFields);
  // Use triggerStart from detectTrigger for accurate positioning,
  // especially for quoted values that contain spaces.
  const wordStartPos =
    trigger.triggerStart != null
      ? $pos.start() + trigger.triggerStart
      : from;

  if (trigger.stage === "field" && trigger.fieldFilter) {
    const suggestions = getFieldSuggestions(trigger.fieldFilter, preloadedFields);
    if (suggestions.length === 0) return null;
    return {
      active: true,
      dismissed: false,
      loading: false,
      stage: "field" as const,
      fieldName: null,
      from: wordStartPos,
      to: from,
      filterText: trigger.fieldFilter,
      suggestions,
      selectedIndex: 0,
    };
  }

  if (trigger.stage === "value" && trigger.fieldName != null) {
    // Async fields return a loading state — suggestions populated later
    if (isAsyncField(trigger.fieldName)) {
      return {
        active: true,
        dismissed: false,
        loading: true,
        stage: "value" as const,
        fieldName: trigger.fieldName,
        from: wordStartPos,
        to: from,
        filterText: trigger.valueFilter ?? "",
        suggestions: [], // may be populated with preloaded data by the view
        selectedIndex: 0,
      };
    }

    // Try static values first
    const staticSuggestions = getValueSuggestions(
      trigger.fieldName,
      trigger.valueFilter ?? "",
    );
    if (staticSuggestions.length > 0) {
      return {
        active: true,
        dismissed: false,
        loading: false,
        stage: "value" as const,
        fieldName: trigger.fieldName,
        from: wordStartPos,
        to: from,
        filterText: trigger.valueFilter ?? "",
        suggestions: staticSuggestions,
        selectedIndex: 0,
      };
    }

    // Preloaded-only fields (tag, data_*): populate synchronously
    if (preloadedFields?.has(trigger.fieldName)) {
      return {
        active: true,
        dismissed: false,
        loading: false,
        stage: "value" as const,
        fieldName: trigger.fieldName,
        from: wordStartPos,
        to: from,
        filterText: trigger.valueFilter ?? "",
        suggestions: [], // populated by the view via preloaded data
        selectedIndex: 0,
      };
    }

    return null;
  }

  return null;
}

// ── Insertion logic ────────────────────────────────────────────

function applyFieldSuggestion(
  view: EditorView,
  suggestion: Suggestion,
  preloaded?: Record<string, Suggestion[]>,
): void {
  const state = autocompletePluginKey.getState(view.state) as AutocompleteState;
  if (!state.active || state.from == null || state.to == null) return;

  const fieldDef = resolveField(suggestion.value);

  // Range fields: replace typed text with "field:" and transition to range stage
  if (fieldDef?.insertBehavior === "range-chip") {
    const rangeConfig = getRangeConfig(suggestion.value);
    if (rangeConfig) {
      const fieldText = `${suggestion.value}:`;
      const tr = view.state.tr;
      tr.replaceWith(state.from, state.to, searchSchema.text(fieldText));
      const newTo = state.from + fieldText.length;
      tr.setSelection(TextSelection.create(tr.doc, newTo));

      const shortcuts: Suggestion[] = rangeConfig.shortcuts.map((s) => ({
        label: s.label,
        value: s.label, // value not used for shortcuts; label identifies them
      }));
      tr.setMeta(autocompletePluginKey, {
        active: true,
        dismissed: false,
        loading: false,
        stage: "range",
        fieldName: suggestion.value,
        from: state.from,
        to: newTo,
        filterText: "",
        suggestions: shortcuts,
        selectedIndex: 0,
      });
      view.dispatch(tr);
      return;
    }
  }

  const tr = view.state.tr;

  // Determine if we should transition to value stage
  const hasStaticValues = fieldDef?.hasValueSuggestions ?? false;
  const hasPreloadedValues = !!(preloaded?.[suggestion.value]?.length);
  const willShowValues =
    hasStaticValues || hasPreloadedValues || isAsyncField(suggestion.value);

  // For fields that accept free-text value input (async or preloaded),
  // insert quotes around the cursor so multi-word values work naturally.
  // Static-value fields (enums like access, status) don't need quotes
  // since the user picks from a fixed list of single-word values.
  const hasStaticOnly = fieldDef?.hasValueSuggestions && !isAsyncField(suggestion.value);
  const useQuotes = willShowValues && !hasStaticOnly;

  const fieldText = useQuotes
    ? `${suggestion.value}:""`
    : `${suggestion.value}:`;
  tr.replaceWith(state.from, state.to, searchSchema.text(fieldText));

  // Place cursor between quotes, or after colon
  const cursorPos = useQuotes
    ? state.from + fieldText.length - 1
    : state.from + fieldText.length;
  tr.setSelection(TextSelection.create(tr.doc, cursorPos));

  if (hasStaticValues || hasPreloadedValues) {
    if (isAsyncField(suggestion.value)) {
      // Async field: show loading state, suggestions fetched by the view
      tr.setMeta(autocompletePluginKey, {
        active: true,
        loading: true,
        stage: "value",
        fieldName: suggestion.value,
        from: state.from,
        to: cursorPos,
        filterText: "",
        suggestions: [],
        selectedIndex: 0,
      });
    } else {
      // Static or preloaded-only: populate synchronously
      const valueSuggestions = hasStaticValues
        ? getValueSuggestions(suggestion.value, "")
        : (preloaded?.[suggestion.value] ?? []);
      tr.setMeta(autocompletePluginKey, {
        active: true,
        loading: false,
        stage: "value",
        fieldName: suggestion.value,
        from: state.from,
        to: cursorPos,
        filterText: "",
        suggestions: valueSuggestions,
        selectedIndex: 0,
      });
    }
  } else {
    tr.setMeta(autocompletePluginKey, INACTIVE);
  }

  view.dispatch(tr);
}

function applyValueSuggestion(
  view: EditorView,
  suggestion: Suggestion,
): void {
  const state = autocompletePluginKey.getState(view.state) as AutocompleteState;
  if (
    !state.active ||
    state.from == null ||
    state.to == null ||
    !state.fieldName
  )
    return;

  const fieldDef = resolveField(state.fieldName);
  if (!fieldDef) return;

  const tr = view.state.tr;

  // Extend replacement range to consume a trailing quote if present
  // (inserted by applyFieldSuggestion for quoted value input)
  let replaceTo = state.to!;
  try {
    const afterChar = view.state.doc.textBetween(replaceTo, replaceTo + 1);
    if (afterChar === '"') replaceTo += 1;
  } catch {
    // At end of doc — no trailing quote
  }

  if (fieldDef.insertBehavior === "sort-chip") {
    // Sort: parse direction from value (e.g., "-created_at" → desc)
    let sortField = suggestion.value;
    let direction = "asc";
    if (sortField.startsWith("-")) {
      sortField = sortField.substring(1);
      direction = "desc";
    }

    const sortNode = searchSchema.nodes.sort.create({
      field: sortField,
      direction,
    });

    tr.replaceWith(state.from, replaceTo, sortNode);
    // Add a space after the chip and place cursor there
    const afterChip = state.from + sortNode.nodeSize;
    tr.insertText("\u00A0", afterChip);
    tr.setSelection(TextSelection.create(tr.doc, afterChip + 1));
  } else if (fieldDef.insertBehavior === "field-value-chip") {
    // Extract prefix from the original text if present
    const originalText = view.state.doc.textBetween(state.from, replaceTo);
    let prefix: string | null = null;
    if (originalText.startsWith("+") || originalText.startsWith("-")) {
      prefix = originalText.charAt(0);
    }

    const chipNode = searchSchema.nodes["field-value"].create({
      field: state.fieldName,
      value: suggestion.value,
      prefix,
      quoted: /\s/.test(suggestion.value),
      displayValue: isAsyncField(state.fieldName) ? suggestion.label : null,
    });

    tr.replaceWith(state.from, replaceTo, chipNode);
    const afterChip = state.from + chipNode.nodeSize;
    tr.insertText("\u00A0", afterChip);
    tr.setSelection(TextSelection.create(tr.doc, afterChip + 1));

  }

  tr.setMeta(autocompletePluginKey, INACTIVE);
  view.dispatch(tr);
}

function applyRangeShortcut(
  view: EditorView,
  suggestion: Suggestion,
): void {
  const state = autocompletePluginKey.getState(view.state) as AutocompleteState;
  if (
    !state.active ||
    state.from == null ||
    state.to == null ||
    !state.fieldName
  )
    return;

  const rangeConfig = getRangeConfig(state.fieldName);
  if (!rangeConfig) return;

  const shortcut = rangeConfig.shortcuts.find(
    (s) => s.label === suggestion.label,
  );
  if (!shortcut) return;

  const tr = view.state.tr;

  // Extract prefix from the original text if present
  const originalText = view.state.doc.textBetween(state.from, state.to);
  let prefix: string | null = null;
  if (originalText.startsWith("+") || originalText.startsWith("-")) {
    prefix = originalText.charAt(0);
  }

  const rangeNode = searchSchema.nodes.range.create({
    field: state.fieldName,
    lower: shortcut.lower,
    upper: shortcut.upper,
    inclusiveLower: shortcut.inclusiveLower ?? true,
    inclusiveUpper: shortcut.inclusiveUpper ?? true,
    prefix,
  });

  tr.replaceWith(state.from, state.to, rangeNode);
  const afterChip = state.from + rangeNode.nodeSize;
  tr.insertText("\u00A0", afterChip);
  tr.setSelection(TextSelection.create(tr.doc, afterChip + 1));

  tr.setMeta(autocompletePluginKey, INACTIVE);
  view.dispatch(tr);
}

const DATE_FIELDS = new Set(["created_at", "updated_at"]);

/** Format a date value for Solr. Bare YYYY-MM-DD dates need time suffixes. */
function formatDateBound(
  value: string,
  position: "lower" | "upper",
): string {
  if (value === "*" || !value) return value;
  // Already has time component or is date math (NOW-...)
  if (/T|NOW/.test(value)) return value;
  // Bare date: append time
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return position === "lower"
      ? `${value}T00:00:00Z`
      : `${value}T23:59:59Z`;
  }
  return value;
}

function applyCustomRange(
  view: EditorView,
  lower: string,
  upper: string,
): void {
  const state = autocompletePluginKey.getState(view.state) as AutocompleteState;
  if (
    !state.active ||
    state.from == null ||
    state.to == null ||
    !state.fieldName
  )
    return;

  const isDateField = DATE_FIELDS.has(state.fieldName);
  const finalLower = isDateField ? formatDateBound(lower, "lower") : lower;
  const finalUpper = isDateField ? formatDateBound(upper, "upper") : upper;

  const tr = view.state.tr;

  // Extract prefix from the original text if present
  const originalText = view.state.doc.textBetween(state.from, state.to);
  let prefix: string | null = null;
  if (originalText.startsWith("+") || originalText.startsWith("-")) {
    prefix = originalText.charAt(0);
  }

  const rangeNode = searchSchema.nodes.range.create({
    field: state.fieldName,
    lower: finalLower,
    upper: finalUpper,
    inclusiveLower: true,
    inclusiveUpper: true,
    prefix,
  });

  tr.replaceWith(state.from, state.to, rangeNode);
  const afterChip = state.from + rangeNode.nodeSize;
  tr.insertText("\u00A0", afterChip);
  tr.setSelection(TextSelection.create(tr.doc, afterChip + 1));

  tr.setMeta(autocompletePluginKey, INACTIVE);
  view.dispatch(tr);
}

function applyFixedValue(view: EditorView, value: string): void {
  const state = autocompletePluginKey.getState(view.state) as AutocompleteState;
  if (
    !state.active ||
    state.from == null ||
    state.to == null ||
    !state.fieldName
  )
    return;

  if (!value) return;

  const isDateField = DATE_FIELDS.has(state.fieldName);
  const finalValue = isDateField ? formatDateBound(value, "lower") : value;

  const tr = view.state.tr;

  // Extract prefix from the original text if present
  const originalText = view.state.doc.textBetween(state.from, state.to);
  let prefix: string | null = null;
  if (originalText.startsWith("+") || originalText.startsWith("-")) {
    prefix = originalText.charAt(0);
  }

  const chipNode = searchSchema.nodes["field-value"].create({
    field: state.fieldName,
    value: finalValue,
    prefix,
    quoted: false,
  });

  tr.replaceWith(state.from, state.to, chipNode);
  const afterChip = state.from + chipNode.nodeSize;
  tr.insertText("\u00A0", afterChip);
  tr.setSelection(TextSelection.create(tr.doc, afterChip + 1));

  tr.setMeta(autocompletePluginKey, INACTIVE);
  view.dispatch(tr);
}

function applySuggestion(
  view: EditorView,
  suggestion: Suggestion,
  preloaded?: Record<string, Suggestion[]>,
): void {
  const state = autocompletePluginKey.getState(view.state) as AutocompleteState;
  if (state.stage === "field") {
    applyFieldSuggestion(view, suggestion, preloaded);
  } else if (state.stage === "range") {
    applyRangeShortcut(view, suggestion);
  } else {
    applyValueSuggestion(view, suggestion);
  }
}

// ── Positioning helper ──────────────────────────────────────────

function positionDropdown(
  dropdown: HTMLElement,
  view: EditorView,
  pos: number,
): void {
  let coords: { top: number; bottom: number; left: number; right: number };
  try {
    coords = view.coordsAtPos(pos);
  } catch {
    // coordsAtPos requires layout (getClientRects); unavailable in jsdom
    return;
  }

  const virtualEl = {
    getBoundingClientRect: () => ({
      width: 0,
      height: coords.bottom - coords.top,
      x: coords.left,
      y: coords.top,
      top: coords.top,
      right: coords.left,
      bottom: coords.bottom,
      left: coords.left,
    }),
  };

  computePosition(virtualEl, dropdown, {
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  }).then(({ x, y }) => {
    dropdown.style.left = `${x}px`;
    dropdown.style.top = `${y}px`;
  });
}

// ── Plugin ─────────────────────────────────────────────────────

let idCounter = 0;

export interface AutocompletePluginOptions {
  /** Returns preloaded suggestions derived from current search results. */
  getPreloadedSuggestions?: () => Record<string, Suggestion[]>;
}

export function autocompletePlugin(
  options: AutocompletePluginOptions = {},
): Plugin<AutocompleteState> {
  return new Plugin<AutocompleteState>({
    key: autocompletePluginKey,

    state: {
      init(): AutocompleteState {
        return { ...INACTIVE };
      },

      apply(tr, state): AutocompleteState {
        // Explicit meta overrides everything
        const meta = tr.getMeta(autocompletePluginKey);
        if (meta) return meta;

        // Doc changes reset autocomplete (and clear dismissed flag so
        // typing can re-activate suggestions)
        if (tr.docChanged) return { ...INACTIVE };

        return state;
      },
    },

    props: {
      handleKeyDown(view, event) {
        const state = this.getState(
          view.state,
        ) as AutocompleteState;

        // Mod+/ opens the full field list when autocomplete is not active
        if (event.key === "/" && (event.metaKey || event.ctrlKey) && !state?.active) {
          event.preventDefault();
          const { from } = view.state.selection;
          const preloaded = options.getPreloadedSuggestions?.();
          const extraFields = preloaded ? new Set(Object.keys(preloaded)) : undefined;
          const suggestions = getAllFieldSuggestions(extraFields);
          view.dispatch(
            view.state.tr.setMeta(autocompletePluginKey, {
              active: true,
              dismissed: false,
              loading: false,
              stage: "field",
              fieldName: null,
              from,
              to: from,
              filterText: "",
              suggestions,
              selectedIndex: 0,
            }),
          );
          return true;
        }

        if (!state?.active || state.suggestions.length === 0) return false;

        switch (event.key) {
          case "ArrowDown": {
            event.preventDefault();
            const next =
              (state.selectedIndex + 1) % state.suggestions.length;
            view.dispatch(
              view.state.tr.setMeta(autocompletePluginKey, {
                ...state,
                selectedIndex: next,
              }),
            );
            return true;
          }

          case "ArrowUp": {
            event.preventDefault();
            const prev =
              (state.selectedIndex + state.suggestions.length - 1) %
              state.suggestions.length;
            view.dispatch(
              view.state.tr.setMeta(autocompletePluginKey, {
                ...state,
                selectedIndex: prev,
              }),
            );
            return true;
          }

          case "Enter":
          case "Tab": {
            event.preventDefault();
            const suggestion = state.suggestions[state.selectedIndex];
            if (suggestion) {
              applySuggestion(
                view,
                suggestion,
                options.getPreloadedSuggestions?.(),
              );
            }
            return true;
          }

          case "Escape": {
            event.preventDefault();
            view.dispatch(
              view.state.tr.setMeta(autocompletePluginKey, DISMISSED),
            );
            return true;
          }
        }

        return false;
      },
    },

    view(editorView) {
      const dropdownId = `search-ac-${++idCounter}`;

      // Container elements for Svelte components, appended to document.body
      const dropdownContainer = document.createElement("div");
      const rangeContainer = document.createElement("div");
      const liveRegion = document.createElement("div");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.className = "sr-only";
      liveRegion.style.position = "absolute";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.overflow = "hidden";
      liveRegion.style.clip = "rect(0 0 0 0)";
      liveRegion.style.whiteSpace = "nowrap";
      document.body.appendChild(dropdownContainer);
      document.body.appendChild(rangeContainer);
      document.body.appendChild(liveRegion);

      // Mount Svelte components eagerly (kept alive for the editor's lifetime).
      // The components' {#if visible} blocks handle show/hide internally.
      const dropdownComponent = new AutocompleteDropdown({
        target: dropdownContainer,
        props: {
          suggestions: [],
          selectedIndex: 0,
          loading: false,
          dropdownId,
          onSelect,
          onHover,
        },
      });
      let rangeComponent: RangeBuilder | null = null;

      // Set ARIA attributes on the editor
      const editorDom = editorView.dom;
      editorDom.setAttribute("aria-autocomplete", "list");
      editorDom.setAttribute("aria-expanded", "false");
      editorDom.setAttribute("aria-owns", dropdownId);

      let prevSuggestionCount = 0;

      // Async fetch state
      let fetchTimer: ReturnType<typeof setTimeout> | null = null;
      let abortController: AbortController | null = null;
      let lastFetchKey = "";
      /** Cache of last successfully fetched async suggestions, keyed by field. */
      let lastAsyncResults: { field: string; suggestions: Suggestion[] } | null =
        null;

      function onSelect(index: number) {
        const state = autocompletePluginKey.getState(
          editorView.state,
        ) as AutocompleteState;
        const suggestion = state.suggestions[index];
        if (suggestion) {
          applySuggestion(
            editorView,
            suggestion,
            options.getPreloadedSuggestions?.(),
          );
        }
        editorView.focus();
      }

      function onHover(index: number) {
        const state = autocompletePluginKey.getState(
          editorView.state,
        ) as AutocompleteState;
        if (state.selectedIndex !== index) {
          editorView.dispatch(
            editorView.state.tr.setMeta(autocompletePluginKey, {
              ...state,
              selectedIndex: index,
            }),
          );
        }
      }

      // Dismiss on click outside editor and dropdown
      function onDocumentMousedown(e: MouseEvent) {
        const target = e.target as Node;
        if (
          !editorDom.contains(target) &&
          !dropdownContainer.contains(target) &&
          !rangeContainer.contains(target)
        ) {
          const state = autocompletePluginKey.getState(
            editorView.state,
          ) as AutocompleteState;
          if (state.active) {
            editorView.dispatch(
              editorView.state.tr.setMeta(autocompletePluginKey, DISMISSED),
            );
          }
        }
      }
      document.addEventListener("mousedown", onDocumentMousedown);

      // Dismiss on editor blur (with delay so dropdown clicks aren't missed)
      function onEditorBlur() {
        setTimeout(() => {
          // Only dismiss if the focus didn't move to the dropdown
          if (
            !dropdownContainer.contains(document.activeElement) &&
            !rangeContainer.contains(document.activeElement)
          ) {
            const state = autocompletePluginKey.getState(
              editorView.state,
            ) as AutocompleteState;
            if (state.active) {
              editorView.dispatch(
                editorView.state.tr.setMeta(autocompletePluginKey, DISMISSED),
              );
            }
          }
        }, 100);
      }
      editorDom.addEventListener("blur", onEditorBlur);

      /** Schedule an async fetch for value suggestions. */
      function scheduleAsyncFetch(
        view: EditorView,
        fieldName: string,
        filterText: string,
      ) {
        const fetchKey = `${fieldName}:${filterText}`;
        if (fetchKey === lastFetchKey) return;
        lastFetchKey = fetchKey;

        // Cancel any pending fetch
        if (fetchTimer) clearTimeout(fetchTimer);
        if (abortController) abortController.abort();

        abortController = new AbortController();

        fetchTimer = setTimeout(async () => {
          try {
            const preloaded = options.getPreloadedSuggestions?.();
            const suggestions = await fetchValueSuggestions(
              fieldName,
              filterText,
              preloaded,
            );
            // Only apply if still relevant
            const currentState = autocompletePluginKey.getState(
              view.state,
            ) as AutocompleteState;
            // Cache results for optimistic display during future loads
            lastAsyncResults = { field: fieldName, suggestions };
            if (
              currentState.active &&
              currentState.fieldName === fieldName &&
              currentState.filterText === filterText
            ) {
              view.dispatch(
                view.state.tr.setMeta(autocompletePluginKey, {
                  ...currentState,
                  loading: false,
                  suggestions,
                  selectedIndex: 0,
                }),
              );
            }
          } catch {
            // On error (including abort), clear loading gracefully
            const currentState = autocompletePluginKey.getState(
              view.state,
            ) as AutocompleteState;
            if (currentState.active && currentState.loading) {
              view.dispatch(
                view.state.tr.setMeta(autocompletePluginKey, {
                  ...currentState,
                  loading: false,
                }),
              );
            }
          }
        }, 300);
      }

      function announceCount(count: number) {
        if (count === 0) {
          liveRegion.textContent = "";
        } else {
          liveRegion.textContent = `${count} suggestion${count === 1 ? "" : "s"} available. Use up and down arrows to navigate.`;
        }
      }

      /** Show the standard dropdown, hide range builder */
      function showDropdown(
        pluginState: AutocompleteState,
        view: EditorView,
      ) {
        // Hide range builder
        if (rangeComponent) {
          rangeComponent.getElement().style.display = "none";
        }

        dropdownComponent.$set({
          suggestions: pluginState.suggestions,
          selectedIndex: pluginState.selectedIndex,
          loading: pluginState.loading,
        });

        const el = dropdownComponent.getElement();
        el.style.display = "block";
        if (pluginState.from != null) {
          positionDropdown(el, view, pluginState.to ?? pluginState.from);
        }
      }

      /** Show the range builder, hide standard dropdown */
      function showRangeBuilder(
        pluginState: AutocompleteState,
        view: EditorView,
      ) {
        // Hide the standard dropdown
        dropdownComponent.getElement().style.display = "none";

        if (!rangeComponent) {
          rangeComponent = new RangeBuilder({
            target: rangeContainer,
            props: {
              fieldName: pluginState.fieldName!,
              suggestions: pluginState.suggestions,
              selectedIndex: pluginState.selectedIndex,
              dropdownId,
              onSelect,
              onHover,
              onCustomRange: (lower: string, upper: string) => {
                applyCustomRange(view, lower, upper);
                editorView.focus();
              },
              onFixedValue: (value: string) => {
                applyFixedValue(view, value);
                editorView.focus();
              },
            },
          });
        } else {
          rangeComponent.$set({
            fieldName: pluginState.fieldName!,
            suggestions: pluginState.suggestions,
            selectedIndex: pluginState.selectedIndex,
          });
        }

        const el = rangeComponent.getElement();
        el.style.display = "block";
        if (pluginState.from != null) {
          positionDropdown(el, view, pluginState.to ?? pluginState.from);
        }
      }

      /** Hide all dropdowns */
      function hideAll() {
        dropdownComponent.getElement().style.display = "none";
        if (rangeComponent) {
          rangeComponent.getElement().style.display = "none";
        }
      }

      return {
        update(view) {
          const pluginState = autocompletePluginKey.getState(
            view.state,
          ) as AutocompleteState;

          // Build the set of preloaded field names for trigger detection
          const preloaded = options.getPreloadedSuggestions?.();
          const preloadedFieldNames = preloaded
            ? new Set(Object.keys(preloaded))
            : undefined;

          // If the plugin state is inactive, try to compute from text
          // (but not if explicitly dismissed — wait for next doc change)
          if (!pluginState.active) {
            lastFetchKey = "";
            const computed = pluginState.dismissed
              ? null
              : computeAutocompleteState(view, preloadedFieldNames);
            if (computed) {
              // Populate interim suggestions synchronously when available,
              // using cached async results (preferred) or preloaded data
              if (
                computed.stage === "value" &&
                computed.fieldName &&
                computed.suggestions.length === 0
              ) {
                const cachedValues =
                  lastAsyncResults?.field === computed.fieldName
                    ? lastAsyncResults.suggestions
                    : null;
                const interimValues =
                  cachedValues ?? preloaded?.[computed.fieldName];
                if (interimValues?.length) {
                  const filter = computed.filterText.toLowerCase();
                  computed.suggestions = filter
                    ? interimValues.filter(
                        (s) =>
                          s.value.toLowerCase().startsWith(filter) ||
                          s.label.toLowerCase().startsWith(filter),
                      )
                    : interimValues;
                  if (
                    computed.suggestions.length === 0 &&
                    !isAsyncField(computed.fieldName)
                  ) {
                    // No matches from interim data and no async fetch coming
                    hideAll();
                    editorDom.setAttribute("aria-expanded", "false");
                    editorDom.removeAttribute("aria-activedescendant");
                    return;
                  }
                }
              }
              // Activate autocomplete
              view.dispatch(
                view.state.tr.setMeta(autocompletePluginKey, computed),
              );
              return; // will re-enter update on the next cycle
            }

            // Truly inactive
            hideAll();
            editorDom.setAttribute("aria-expanded", "false");
            editorDom.removeAttribute("aria-activedescendant");
            if (prevSuggestionCount !== 0) {
              announceCount(0);
              prevSuggestionCount = 0;
            }
            return;
          }

          // Range stage is modal: don't re-compute from text.
          // It persists until the user selects a shortcut or dismisses.
          if (pluginState.stage === "range" && pluginState.fieldName) {
            showRangeBuilder(pluginState, view);
            editorDom.setAttribute("aria-expanded", "true");
            const activeId = `${dropdownId}-opt-${pluginState.selectedIndex}`;
            editorDom.setAttribute("aria-activedescendant", activeId);
            if (pluginState.suggestions.length !== prevSuggestionCount) {
              announceCount(pluginState.suggestions.length);
              prevSuggestionCount = pluginState.suggestions.length;
            }
            return;
          }

          // Active: re-check trigger to update filter/suggestions.
          // For async fields in loading state, skip the re-compute that would
          // override the loading state with a fresh loading state (loop).
          if (
            !pluginState.loading ||
            !pluginState.fieldName ||
            !isAsyncField(pluginState.fieldName)
          ) {
            const computed = computeAutocompleteState(view, preloadedFieldNames);
            if (computed) {
              if (
                computed.filterText !== pluginState.filterText ||
                computed.stage !== pluginState.stage ||
                computed.fieldName !== pluginState.fieldName
              ) {
                // Populate interim suggestions using cached or preloaded data
                if (
                  computed.stage === "value" &&
                  computed.fieldName &&
                  computed.suggestions.length === 0
                ) {
                  const cachedValues =
                    lastAsyncResults?.field === computed.fieldName
                      ? lastAsyncResults.suggestions
                      : null;
                  const interimValues =
                    cachedValues ?? preloaded?.[computed.fieldName];
                  if (interimValues?.length) {
                    const filter = computed.filterText.toLowerCase();
                    computed.suggestions = filter
                      ? interimValues.filter(
                          (s) =>
                            s.value.toLowerCase().startsWith(filter) ||
                            s.label.toLowerCase().startsWith(filter),
                        )
                      : interimValues;
                  }
                }
                const clamped = Math.min(
                  pluginState.selectedIndex,
                  Math.max(0, computed.suggestions.length - 1),
                );
                view.dispatch(
                  view.state.tr.setMeta(autocompletePluginKey, {
                    ...computed,
                    selectedIndex: Math.max(0, clamped),
                  }),
                );
                return;
              }
            } else if (pluginState.filterText !== "") {
              // Only deactivate if the user had been typing a filter that no
              // longer matches. When filterText is "" (opened via "/"), we keep
              // the dropdown open until an explicit dismiss (Escape, selection).
              view.dispatch(
                view.state.tr.setMeta(autocompletePluginKey, { ...INACTIVE }),
              );
              return;
            }
          }

          // Trigger async fetch when in loading state
          if (
            pluginState.loading &&
            pluginState.fieldName &&
            isAsyncField(pluginState.fieldName)
          ) {
            scheduleAsyncFetch(
              view,
              pluginState.fieldName,
              pluginState.filterText,
            );
          }

          // Render the dropdown
          showDropdown(pluginState, view);

          // Update ARIA
          editorDom.setAttribute("aria-expanded", "true");
          const activeId = `${dropdownId}-opt-${pluginState.selectedIndex}`;
          editorDom.setAttribute("aria-activedescendant", activeId);

          // Announce changes
          if (pluginState.suggestions.length !== prevSuggestionCount) {
            announceCount(pluginState.suggestions.length);
            prevSuggestionCount = pluginState.suggestions.length;
          }
        },

        destroy() {
          if (fetchTimer) clearTimeout(fetchTimer);
          if (abortController) abortController.abort();
          document.removeEventListener("mousedown", onDocumentMousedown);
          editorDom.removeEventListener("blur", onEditorBlur);
          dropdownComponent.$destroy();
          if (rangeComponent) rangeComponent.$destroy();
          dropdownContainer.remove();
          rangeContainer.remove();
          liveRegion.remove();
          editorDom.removeAttribute("aria-autocomplete");
          editorDom.removeAttribute("aria-expanded");
          editorDom.removeAttribute("aria-owns");
          editorDom.removeAttribute("aria-activedescendant");
        },
      };
    },
  });
}
