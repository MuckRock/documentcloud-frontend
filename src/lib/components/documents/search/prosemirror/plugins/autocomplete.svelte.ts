import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import {
  getAllFieldSuggestions,
  getFieldSuggestions,
  getValueSuggestions,
  detectTrigger,
  resolveField,
  isAsyncField,
  getRangeConfig,
  type Suggestion,
} from "./autocomplete-data";
import { searchSchema } from "../schema";
import { AutocompleteViewController } from "./autocomplete-view-controller.svelte";

// PluginKey is a unique handle for reading this plugin's state from any EditorState
export const autocompletePluginKey = new PluginKey("autocomplete");

// ── State ──────────────────────────────────────────────────────

export interface AutocompleteState {
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

export const INACTIVE: AutocompleteState = {
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

export const DISMISSED: AutocompleteState = {
  ...INACTIVE,
  dismissed: true,
};

// ── Trigger detection (from PM state) ──────────────────────────

/**
 * Examine the text before the cursor and determine if autocomplete should
 * be active. Returns a new AutocompleteState or null if inactive.
 */
export function computeAutocompleteState(
  view: EditorView,
  preloadedFields?: Set<string>,
): AutocompleteState | null {
  const { doc, selection } = view.state;
  const { from, to } = selection;

  // Only for collapsed cursors in text
  if (from !== to) return null;
  if (from < 1 || from > doc.content.size) return null;

  // resolve() enriches a raw position with structural context (parent node, depth, etc.)
  const resolvedPos = doc.resolve(from);
  if (resolvedPos.parent.type.name !== "paragraph") return null;

  // Get text from start of paragraph to cursor.
  // Use space as the leaf-text separator so atom nodes produce a
  // space boundary, keeping word detection correct.
  // textBetween extracts text between two positions; the separator args replace
  // leaf boundaries (like atom nodes) with spaces so word detection stays correct
  const textBeforeCursor = doc.textBetween(resolvedPos.start(), from, " ", " ");

  const trigger = detectTrigger(textBeforeCursor, preloadedFields);
  // Use triggerStart from detectTrigger for accurate positioning,
  // especially for quoted values that contain spaces.
  const wordStartPos =
    trigger.triggerStart != null
      ? resolvedPos.start() + trigger.triggerStart
      : from;

  if (trigger.stage === "field" && trigger.fieldFilter) {
    const suggestions = getFieldSuggestions(
      trigger.fieldFilter,
      preloadedFields,
    );
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

// ── Insertion helpers ──────────────────────────────────────────

/** Extract a leading +/- prefix from the text in a doc range, or null. */
function extractPrefix(
  doc: import("prosemirror-model").Node,
  from: number,
  to: number,
): string | null {
  const text = doc.textBetween(from, to);
  return text.startsWith("+") || text.startsWith("-") ? text.charAt(0) : null;
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
  if (fieldDef?.insertBehavior === "range-atom") {
    const rangeConfig = getRangeConfig(suggestion.value);
    if (rangeConfig) {
      const fieldText = `${suggestion.value}:`;
      // Accessing .tr creates a fresh Transaction from the current state
      const tr = view.state.tr;
      // Replace the typed text range with a new text node containing the field name
      tr.replaceWith(state.from, state.to, searchSchema.text(fieldText));
      const newTo = state.from + fieldText.length;
      // Programmatically place the cursor at the end of the inserted text
      tr.setSelection(TextSelection.create(tr.doc, newTo));

      const shortcuts: Suggestion[] = rangeConfig.shortcuts.map((s) => ({
        label: s.label,
        value: s.label, // value not used for shortcuts; label identifies them
      }));
      // Transaction metadata: plugins read this to update their own state without changing the doc
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
      // dispatch() sends the transaction through the state cycle: apply → new state → re-render
      view.dispatch(tr);
      return;
    }
  }

  const tr = view.state.tr;

  // Determine if we should transition to value stage
  const hasStaticValues = fieldDef?.hasValueSuggestions ?? false;
  const hasPreloadedValues = !!preloaded?.[suggestion.value]?.length;
  const willShowValues =
    hasStaticValues || hasPreloadedValues || isAsyncField(suggestion.value);

  // For fields that accept free-text value input (async or preloaded),
  // insert quotes around the cursor so multi-word values work naturally.
  // Static-value fields (enums like access, status) don't need quotes
  // since the user picks from a fixed list of single-word values.
  const hasStaticOnly =
    fieldDef?.hasValueSuggestions && !isAsyncField(suggestion.value);
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

function applyValueSuggestion(view: EditorView, suggestion: Suggestion): void {
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

  if (fieldDef.insertBehavior === "sort-atom") {
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
    // Add a space after the atom and place cursor there
    const afterAtom = state.from + sortNode.nodeSize;
    // Insert a non-breaking space (\u00A0) as a separator — regular spaces collapse in contenteditable
    tr.insertText("\u00A0", afterAtom);
    tr.setSelection(TextSelection.create(tr.doc, afterAtom + 1));
  } else if (fieldDef.insertBehavior === "field-value-atom") {
    const prefix = extractPrefix(view.state.doc, state.from, replaceTo);

    const atomNode = searchSchema.nodes["field-value"].create({
      field: state.fieldName,
      value: suggestion.value,
      prefix,
      quoted: /\s/.test(suggestion.value),
      displayValue: isAsyncField(state.fieldName) ? suggestion.label : null,
    });

    tr.replaceWith(state.from, replaceTo, atomNode);
    const afterAtom = state.from + atomNode.nodeSize;
    tr.insertText("\u00A0", afterAtom);
    tr.setSelection(TextSelection.create(tr.doc, afterAtom + 1));
  }

  tr.setMeta(autocompletePluginKey, INACTIVE);
  view.dispatch(tr);
}

function applyRangeShortcut(view: EditorView, suggestion: Suggestion): void {
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
  const prefix = extractPrefix(view.state.doc, state.from, state.to);

  const rangeNode = searchSchema.nodes.range.create({
    field: state.fieldName,
    lower: shortcut.lower,
    upper: shortcut.upper,
    inclusiveLower: shortcut.inclusiveLower ?? true,
    inclusiveUpper: shortcut.inclusiveUpper ?? true,
    prefix,
  });

  tr.replaceWith(state.from, state.to, rangeNode);
  const afterAtom = state.from + rangeNode.nodeSize;
  tr.insertText("\u00A0", afterAtom);
  tr.setSelection(TextSelection.create(tr.doc, afterAtom + 1));

  tr.setMeta(autocompletePluginKey, INACTIVE);
  view.dispatch(tr);
}

const DATE_FIELDS = new Set(["created_at", "updated_at"]);

/** Format a date value for Solr. Bare YYYY-MM-DD dates need time suffixes. */
function formatDateBound(value: string, position: "lower" | "upper"): string {
  if (value === "*" || !value) return value;
  // Already has time component or is date math (NOW-...)
  if (/T|NOW/.test(value)) return value;
  // Bare date: append time
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return position === "lower" ? `${value}T00:00:00Z` : `${value}T23:59:59Z`;
  }
  return value;
}

export function applyCustomRange(
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
  const prefix = extractPrefix(view.state.doc, state.from, state.to);

  const rangeNode = searchSchema.nodes.range.create({
    field: state.fieldName,
    lower: finalLower,
    upper: finalUpper,
    inclusiveLower: true,
    inclusiveUpper: true,
    prefix,
  });

  tr.replaceWith(state.from, state.to, rangeNode);
  const afterAtom = state.from + rangeNode.nodeSize;
  tr.insertText("\u00A0", afterAtom);
  tr.setSelection(TextSelection.create(tr.doc, afterAtom + 1));

  tr.setMeta(autocompletePluginKey, INACTIVE);
  view.dispatch(tr);
}

export function applyFixedValue(view: EditorView, value: string): void {
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
  const prefix = extractPrefix(view.state.doc, state.from, state.to);

  const atomNode = searchSchema.nodes["field-value"].create({
    field: state.fieldName,
    value: finalValue,
    prefix,
    quoted: false,
  });

  tr.replaceWith(state.from, state.to, atomNode);
  const afterAtom = state.from + atomNode.nodeSize;
  tr.insertText("\u00A0", afterAtom);
  tr.setSelection(TextSelection.create(tr.doc, afterAtom + 1));

  tr.setMeta(autocompletePluginKey, INACTIVE);
  view.dispatch(tr);
}

export function applySuggestion(
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

/**
 * Populate interim suggestions on an autocomplete state in the value stage,
 * using cached async results or preloaded data.
 * Mutates `computed.suggestions` in place. Returns false if filtering
 * produced no matches and the field is not async (caller should hide).
 */
export function populateInterimSuggestions(
  computed: AutocompleteState,
  lastAsyncResults: { field: string; suggestions: Suggestion[] } | null,
  preloaded: Record<string, Suggestion[]> | undefined,
): boolean {
  if (
    computed.stage !== "value" ||
    !computed.fieldName ||
    computed.suggestions.length > 0
  )
    return true;
  const cachedValues =
    lastAsyncResults?.field === computed.fieldName
      ? lastAsyncResults.suggestions
      : null;
  const interimValues = cachedValues ?? preloaded?.[computed.fieldName];
  if (!interimValues?.length) return true;
  const filter = computed.filterText.toLowerCase();
  computed.suggestions = filter
    ? interimValues.filter(
        (s) =>
          s.value.toLowerCase().startsWith(filter) ||
          s.label.toLowerCase().startsWith(filter),
      )
    : interimValues;
  if (computed.suggestions.length === 0 && !isAsyncField(computed.fieldName)) {
    return false; // no matches and no async fetch coming
  }
  return true;
}

// ── Plugin ─────────────────────────────────────────────────────

export interface AutocompletePluginOptions {
  /** Returns preloaded suggestions derived from current search results. */
  getPreloadedSuggestions?: () => Record<string, Suggestion[]>;
}

export function autocompletePlugin(
  options: AutocompletePluginOptions = {},
): Plugin<AutocompleteState> {
  return new Plugin<AutocompleteState>({
    key: autocompletePluginKey,

    // Plugin state lifecycle: init() runs once at creation, apply() runs on every transaction.
    // This gives each plugin its own managed state that updates in lockstep with the doc.
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
      // Plugin props intercept editor events before default handling.
      // Return true to "consume" the event and prevent further processing.
      handleKeyDown(view, event) {
        const state = this.getState(view.state) as AutocompleteState;

        // Mod+/ opens the full field list when autocomplete is not active
        if (
          event.key === "/" &&
          (event.metaKey || event.ctrlKey) &&
          !state?.active
        ) {
          event.preventDefault();
          const { from } = view.state.selection;
          const preloaded = options.getPreloadedSuggestions?.();
          const extraFields = preloaded
            ? new Set(Object.keys(preloaded))
            : undefined;
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
            const next = (state.selectedIndex + 1) % state.suggestions.length;
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

          case "Tab": {
            if (state.stage === "range") {
              // Move focus into the RangeBuilder dialog
              const rangeEl = document.querySelector(
                ".search-ac-range",
              ) as HTMLElement | null;
              if (rangeEl) {
                event.preventDefault();
                rangeEl.focus();
                return true;
              }
            }
            // Fall through to accept suggestion for field/value stages
            event.preventDefault();
            const tabSuggestion = state.suggestions[state.selectedIndex];
            if (tabSuggestion) {
              applySuggestion(
                view,
                tabSuggestion,
                options.getPreloadedSuggestions?.(),
              );
            }
            return true;
          }

          case "Enter": {
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

    // The view() lifecycle hook runs when the EditorView is created, returning
    // update/destroy callbacks that track the editor's lifecycle.
    view(editorView) {
      const vc = new AutocompleteViewController(editorView, options);
      return {
        update(view) {
          vc.update(view);
        },
        destroy() {
          vc.destroy();
        },
      };
    },
  });
}
