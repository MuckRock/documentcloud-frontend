import type { EditorView } from "prosemirror-view";

import { computePosition, flip, offset, shift } from "@floating-ui/dom";
import { flushSync, mount, unmount } from "svelte";

import {
  isAsyncField,
  fetchValueSuggestions,
  type Suggestion,
} from "./autocomplete-data";
import AutocompleteDropdown from "../../AutocompleteDropdown.svelte";
import RangeBuilder from "../../RangeBuilder.svelte";
import {
  autocompletePluginKey,
  computeAutocompleteState,
  applySuggestion,
  applyCustomRange,
  applyFixedValue,
  populateInterimSuggestions,
  INACTIVE,
  DISMISSED,
  type AutocompleteState,
  type AutocompletePluginOptions,
} from "./autocomplete.svelte";

// ── Positioning helper ──────────────────────────────────────────

function positionDropdown(
  dropdown: HTMLElement,
  view: EditorView,
  pos: number,
): void {
  let coords: { top: number; bottom: number; left: number; right: number };
  try {
    // Map a PM document position to screen pixel coordinates for dropdown positioning
    coords = view.coordsAtPos(pos);
  } catch {
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

// ── View Controller ─────────────────────────────────────────────

let idCounter = 0;

export class AutocompleteViewController {
  private dropdownContainer: HTMLElement;
  private rangeContainer: HTMLElement;
  private liveRegion: HTMLElement;
  private dropdownComponent: ReturnType<typeof mount>;
  private dropdownProps: {
    suggestions: Suggestion[];
    selectedIndex: number;
    loading: boolean;
    dropdownId: string;
    onSelect: (index: number) => void;
    onHover: (index: number) => void;
  };
  private rangeProps: Record<string, any> = $state({});
  private rangeComponent: Record<string, any> | null = null;
  private fetchTimer: ReturnType<typeof setTimeout> | null = null;
  private abortController: AbortController | null = null;
  private lastFetchKey = "";
  private lastAsyncResults: {
    field: string;
    suggestions: Suggestion[];
  } | null = null;
  private prevSuggestionCount = 0;
  private dropdownId: string;
  private editorDom: HTMLElement;
  private onDocumentMousedown: (e: MouseEvent) => void;
  private onEditorBlur: () => void;

  constructor(
    private editorView: EditorView,
    private options: AutocompletePluginOptions,
  ) {
    this.dropdownId = `search-ac-${++idCounter}`;

    // Container elements for Svelte components, appended to document.body
    this.dropdownContainer = document.createElement("div");
    this.rangeContainer = document.createElement("div");
    this.liveRegion = document.createElement("div");
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("aria-atomic", "true");
    this.liveRegion.className = "sr-only";
    this.liveRegion.style.position = "absolute";
    this.liveRegion.style.width = "1px";
    this.liveRegion.style.height = "1px";
    this.liveRegion.style.overflow = "hidden";
    this.liveRegion.style.clip = "rect(0 0 0 0)";
    this.liveRegion.style.whiteSpace = "nowrap";
    document.body.appendChild(this.dropdownContainer);
    document.body.appendChild(this.rangeContainer);
    document.body.appendChild(this.liveRegion);

    // Mount Svelte components eagerly
    this.dropdownProps = $state({
      suggestions: [] as Suggestion[],
      selectedIndex: 0,
      loading: false,
      dropdownId: this.dropdownId,
      onSelect: (index: number) => this.onSelect(index),
      onHover: (index: number) => this.onHover(index),
    });
    this.dropdownComponent = mount(AutocompleteDropdown, {
      target: this.dropdownContainer,
      props: this.dropdownProps,
    });

    // Set ARIA attributes on the editor
    // editorView.dom is the contenteditable element that PM renders into
    this.editorDom = editorView.dom;
    this.editorDom.setAttribute("aria-autocomplete", "list");
    this.editorDom.setAttribute("aria-expanded", "false");
    this.editorDom.setAttribute("aria-controls", this.dropdownId);

    // Dismiss on click outside editor and dropdown
    this.onDocumentMousedown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !this.editorDom.contains(target) &&
        !this.dropdownContainer.contains(target) &&
        !this.rangeContainer.contains(target)
      ) {
        // Read this plugin's state from the current editor state using its PluginKey
        const state = autocompletePluginKey.getState(
          this.editorView.state,
        ) as AutocompleteState;
        if (state.active) {
          // Dispatch a metadata-only transaction (no doc change) to update plugin state
          this.editorView.dispatch(
            this.editorView.state.tr.setMeta(autocompletePluginKey, DISMISSED),
          );
        }
      }
    };
    document.addEventListener("mousedown", this.onDocumentMousedown);

    // Dismiss on editor blur (with delay so dropdown clicks aren't missed)
    this.onEditorBlur = () => {
      setTimeout(() => {
        if (
          !this.dropdownContainer.contains(document.activeElement) &&
          !this.rangeContainer.contains(document.activeElement)
        ) {
          const state = autocompletePluginKey.getState(
            this.editorView.state,
          ) as AutocompleteState;
          if (state.active) {
            this.editorView.dispatch(
              this.editorView.state.tr.setMeta(
                autocompletePluginKey,
                DISMISSED,
              ),
            );
          }
        }
      }, 100);
    };
    this.editorDom.addEventListener("blur", this.onEditorBlur);
  }

  private onSelect(index: number): void {
    const state = autocompletePluginKey.getState(
      this.editorView.state,
    ) as AutocompleteState;
    const suggestion = state.suggestions[index];
    if (suggestion) {
      applySuggestion(
        this.editorView,
        suggestion,
        this.options.getPreloadedSuggestions?.(),
      );
    }
    this.editorView.focus();
  }

  private onHover(index: number): void {
    const state = autocompletePluginKey.getState(
      this.editorView.state,
    ) as AutocompleteState;
    if (state.selectedIndex !== index) {
      this.editorView.dispatch(
        this.editorView.state.tr.setMeta(autocompletePluginKey, {
          ...state,
          selectedIndex: index,
        }),
      );
    }
  }

  private clearActiveDescendant(): void {
    const current = this.editorDom.getAttribute("aria-activedescendant");
    if (current && current.startsWith(this.dropdownId)) {
      this.editorDom.removeAttribute("aria-activedescendant");
    }
  }

  private scheduleAsyncFetch(
    view: EditorView,
    fieldName: string,
    filterText: string,
  ): void {
    const fetchKey = `${fieldName}:${filterText}`;
    if (fetchKey === this.lastFetchKey) return;
    this.lastFetchKey = fetchKey;

    if (this.fetchTimer) clearTimeout(this.fetchTimer);
    if (this.abortController) this.abortController.abort();

    this.abortController = new AbortController();

    this.fetchTimer = setTimeout(async () => {
      try {
        const preloaded = this.options.getPreloadedSuggestions?.();
        const suggestions = await fetchValueSuggestions(
          fieldName,
          filterText,
          preloaded,
        );
        const currentState = autocompletePluginKey.getState(
          view.state,
        ) as AutocompleteState;
        this.lastAsyncResults = { field: fieldName, suggestions };
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

  private announceCount(
    count: number,
    stage: string,
    fieldName: string | null,
  ): void {
    if (count === 0) {
      this.liveRegion.textContent = "";
    } else {
      let context = "";
      if (stage === "value" && fieldName) {
        context = ` for ${fieldName}`;
      } else if (stage === "range" && fieldName) {
        context = ` for ${fieldName} range`;
      }
      this.liveRegion.textContent = `${count} suggestion${count === 1 ? "" : "s"}${context} available. Use up and down arrows to navigate.`;
    }
  }

  private showDropdown(pluginState: AutocompleteState, view: EditorView): void {
    if (this.rangeComponent) {
      this.rangeComponent.getElement()?.style.setProperty("display", "none");
    }

    this.dropdownProps.suggestions = pluginState.suggestions;
    this.dropdownProps.selectedIndex = pluginState.selectedIndex;
    this.dropdownProps.loading = pluginState.loading;

    const el = this.dropdownComponent.getElement();
    if (el) {
      el.style.display = "block";
      if (pluginState.from != null) {
        positionDropdown(el, view, pluginState.to ?? pluginState.from);
      }
    }
  }

  private showRangeBuilder(
    pluginState: AutocompleteState,
    view: EditorView,
  ): void {
    this.dropdownComponent.getElement()?.style.setProperty("display", "none");

    if (!this.rangeComponent) {
      Object.assign(this.rangeProps, {
        fieldName: pluginState.fieldName!,
        suggestions: pluginState.suggestions,
        selectedIndex: pluginState.selectedIndex,
        dropdownId: this.dropdownId,
        onSelect: (index: number) => this.onSelect(index),
        onHover: (index: number) => this.onHover(index),
        onCustomRange: (lower: string, upper: string) => {
          applyCustomRange(view, lower, upper);
          this.editorView.focus();
        },
        onFixedValue: (value: string) => {
          applyFixedValue(view, value);
          this.editorView.focus();
        },
        onFocusEditor: () => {
          this.editorView.focus();
        },
        onDismiss: () => {
          this.editorView.focus();
          this.editorView.dispatch(
            this.editorView.state.tr.setMeta(autocompletePluginKey, DISMISSED),
          );
        },
      });
      flushSync(() => {
        this.rangeComponent = mount(RangeBuilder, {
          target: this.rangeContainer,
          props: this.rangeProps,
        });
      });
    } else {
      this.rangeProps.fieldName = pluginState.fieldName!;
      this.rangeProps.suggestions = pluginState.suggestions;
      this.rangeProps.selectedIndex = pluginState.selectedIndex;
    }

    const el = this.rangeComponent?.getElement();
    if (el) {
      el.style.display = "block";
      if (pluginState.from != null) {
        positionDropdown(el, view, pluginState.to ?? pluginState.from);
      }
    }
  }

  private hideAll(): void {
    this.dropdownComponent.getElement()?.style.setProperty("display", "none");
    if (this.rangeComponent) {
      this.rangeComponent.getElement()?.style.setProperty("display", "none");
    }
  }

  /** Mark the dropdown as expanded and update ARIA + screen reader announcements. */
  private setExpandedAria(pluginState: AutocompleteState): void {
    this.editorDom.setAttribute("aria-expanded", "true");
    const activeId = `${this.dropdownId}-opt-${pluginState.selectedIndex}`;
    this.editorDom.setAttribute("aria-activedescendant", activeId);
    if (pluginState.suggestions.length !== this.prevSuggestionCount) {
      this.announceCount(
        pluginState.suggestions.length,
        pluginState.stage,
        pluginState.fieldName,
      );
      this.prevSuggestionCount = pluginState.suggestions.length;
    }
  }

  /** Mark the dropdown as collapsed and clear ARIA state. */
  private setCollapsedAria(): void {
    this.editorDom.setAttribute("aria-expanded", "false");
    this.clearActiveDescendant();
    if (this.prevSuggestionCount !== 0) {
      this.announceCount(0, "field", null);
      this.prevSuggestionCount = 0;
    }
  }

  /**
   * Plugin state is not active — try to auto-activate from the cursor
   * position, or hide the UI and reset ARIA.
   */
  private handleInactive(
    view: EditorView,
    pluginState: AutocompleteState,
    preloadedFieldNames: Set<string> | undefined,
    preloaded: Record<string, Suggestion[]> | undefined,
  ): void {
    this.lastFetchKey = "";
    const computed = pluginState.dismissed
      ? null
      : computeAutocompleteState(view, preloadedFieldNames);

    if (computed) {
      if (
        !populateInterimSuggestions(computed, this.lastAsyncResults, preloaded)
      ) {
        this.hideAll();
        this.setCollapsedAria();
        return;
      }
      view.dispatch(view.state.tr.setMeta(autocompletePluginKey, computed));
      return;
    }

    this.hideAll();
    this.setCollapsedAria();
  }

  /** Active in the "range" stage — show the range builder popover. */
  private handleActiveRange(
    view: EditorView,
    pluginState: AutocompleteState,
  ): void {
    this.showRangeBuilder(pluginState, view);
    this.setExpandedAria(pluginState);
  }

  /**
   * Active in "field" or "value" stage — recompute suggestions if the
   * cursor context changed, kick off async fetches, and show the dropdown.
   */
  private handleActiveDropdown(
    view: EditorView,
    pluginState: AutocompleteState,
    preloadedFieldNames: Set<string> | undefined,
    preloaded: Record<string, Suggestion[]> | undefined,
  ): void {
    // Recompute if not waiting on an async fetch
    if (
      !pluginState.loading ||
      !pluginState.fieldName ||
      !isAsyncField(pluginState.fieldName)
    ) {
      const computed = computeAutocompleteState(view, preloadedFieldNames);
      if (computed) {
        const triggerChanged =
          computed.filterText !== pluginState.filterText ||
          computed.stage !== pluginState.stage ||
          computed.fieldName !== pluginState.fieldName;

        // Re-populate when the trigger context changed, or when the current
        // state has no suggestions yet (e.g. tag/data_* fields that need
        // wildcard injection after applyFieldSuggestion sets up an empty list).
        if (triggerChanged || pluginState.suggestions.length === 0) {
          populateInterimSuggestions(
            computed,
            this.lastAsyncResults,
            preloaded,
          );
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
        view.dispatch(
          view.state.tr.setMeta(autocompletePluginKey, { ...INACTIVE }),
        );
        return;
      }
    }

    // Kick off debounced API fetch for async fields
    if (
      pluginState.loading &&
      pluginState.fieldName &&
      isAsyncField(pluginState.fieldName)
    ) {
      this.scheduleAsyncFetch(
        view,
        pluginState.fieldName,
        pluginState.filterText,
      );
    }

    this.showDropdown(pluginState, view);
    this.setExpandedAria(pluginState);
  }

  update(view: EditorView): void {
    const pluginState = autocompletePluginKey.getState(
      view.state,
    ) as AutocompleteState;

    const preloaded = this.options.getPreloadedSuggestions?.();
    const preloadedFieldNames = preloaded
      ? new Set(Object.keys(preloaded))
      : undefined;

    if (!pluginState.active) {
      this.handleInactive(view, pluginState, preloadedFieldNames, preloaded);
    } else if (pluginState.stage === "range" && pluginState.fieldName) {
      this.handleActiveRange(view, pluginState);
    } else {
      this.handleActiveDropdown(
        view,
        pluginState,
        preloadedFieldNames,
        preloaded,
      );
    }
  }

  destroy(): void {
    if (this.fetchTimer) clearTimeout(this.fetchTimer);
    if (this.abortController) this.abortController.abort();
    document.removeEventListener("mousedown", this.onDocumentMousedown);
    this.editorDom.removeEventListener("blur", this.onEditorBlur);
    unmount(this.dropdownComponent);
    if (this.rangeComponent) unmount(this.rangeComponent);
    this.dropdownContainer.remove();
    this.rangeContainer.remove();
    this.liveRegion.remove();
    this.editorDom.removeAttribute("aria-autocomplete");
    this.editorDom.removeAttribute("aria-expanded");
    this.editorDom.removeAttribute("aria-controls");
    this.editorDom.removeAttribute("aria-activedescendant");
  }
}
