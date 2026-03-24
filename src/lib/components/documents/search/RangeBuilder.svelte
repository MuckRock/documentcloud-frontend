<!--
  RangeBuilder renders an autocomplete dropdown for range fields.
  Shows fixed value input, range shortcuts, and custom range inputs.
-->
<script lang="ts">
  import type { Suggestion } from "./prosemirror/plugins/autocomplete-data";
  import { getRangeConfig } from "./prosemirror/plugins/autocomplete-data";

  interface Props {
    fieldName: string;
    suggestions?: Suggestion[];
    selectedIndex?: number;
    dropdownId: string;
    onSelect: (index: number) => void;
    onHover: (index: number) => void;
    onCustomRange: (lower: string, upper: string) => void;
    onFixedValue: (value: string) => void;
    onFocusEditor: () => void;
    onDismiss: () => void;
  }

  let {
    fieldName,
    suggestions = [],
    selectedIndex = 0,
    dropdownId,
    onSelect,
    onHover,
    onCustomRange,
    onFixedValue,
    onFocusEditor,
    onDismiss,
  }: Props = $props();

  let dropdown: HTMLElement | undefined = $state();
  let fixedInput: HTMLInputElement | undefined = $state();
  let startInput: HTMLInputElement | undefined = $state();
  let endInput: HTMLInputElement | undefined = $state();

  let rangeConfig = $derived(getRangeConfig(fieldName));
  let isDateField = $derived(
    fieldName === "created_at" || fieldName === "updated_at",
  );

  /** Expose the dropdown element so the plugin can position it. */
  export function getElement(): HTMLElement | undefined {
    return dropdown;
  }

  function handleFixedInsert() {
    if (fixedInput?.value) onFixedValue(fixedInput.value);
  }

  function handleFixedKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleFixedInsert();
    }
  }

  function handleRangeInsert() {
    const lower = startInput?.value || "*";
    const upper = endInput?.value || "*";
    onCustomRange(lower, upper);
  }

  function handleRangeKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleRangeInsert();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onDismiss();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      onFocusEditor();
    } else if (e.key === "Tab" && dropdown) {
      const focusable = Array.from(
        dropdown.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex="0"]',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey) {
        if (
          document.activeElement === first ||
          document.activeElement === dropdown
        ) {
          e.preventDefault();
          onFocusEditor();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          onFocusEditor();
        }
      }
    }
  }
</script>

<div
  bind:this={dropdown}
  class="search-autocomplete search-ac-range"
  role="dialog"
  aria-label="Range builder"
  tabindex="0"
  id={dropdownId}
  style="position: absolute; display: none;"
  onkeydown={handleKeydown}
>
  {#if rangeConfig}
    <!-- Fixed (single-value) section -->
    <div class="search-ac-section-label">Fixed</div>
    <div class="search-ac-range-inputs">
      <div class="search-ac-range-field">
        <label for="{dropdownId}-fixed">Value</label>
        {#if isDateField}
          <input
            bind:this={fixedInput}
            id="{dropdownId}-fixed"
            type="date"
            placeholder="YYYY-MM-DD"
            onmousedown={(e) => e.stopPropagation()}
            onkeydown={handleFixedKeydown}
          />
        {:else}
          <input
            bind:this={fixedInput}
            id="{dropdownId}-fixed"
            type="number"
            placeholder="0"
            onmousedown={(e) => e.stopPropagation()}
            onkeydown={handleFixedKeydown}
          />
        {/if}
      </div>
      <button
        class="search-ac-insert-btn"
        type="button"
        onmousedown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFixedInsert();
        }}
      >
        Insert
      </button>
    </div>

    <hr class="search-ac-separator" />

    <!-- Range section -->
    <div class="search-ac-section-label">Range</div>

    <!-- Shortcuts -->
    <div role="listbox" aria-label="Range shortcuts">
      {#each suggestions as suggestion, index}
        <div
          class="search-ac-option"
          class:selected={index === selectedIndex}
          role="option"
          tabindex="0"
          id="{dropdownId}-opt-{index}"
          aria-selected={index === selectedIndex}
          onmousedown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(index);
          }}
          onmouseenter={() => onHover(index)}
          onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onSelect(index);
            }
          }}
        >
          <span class="search-ac-label">{suggestion.label}</span>
        </div>
      {/each}
    </div>

    {#if suggestions.length > 0}
      <hr class="search-ac-separator" />
    {/if}

    <!-- Custom range inputs -->
    <div class="search-ac-range-inputs">
      <div class="search-ac-range-field">
        <label for="{dropdownId}-start">{rangeConfig.startLabel}</label>
        {#if isDateField}
          <input
            bind:this={startInput}
            id="{dropdownId}-start"
            type="date"
            placeholder="YYYY-MM-DD"
            onmousedown={(e) => e.stopPropagation()}
            onkeydown={handleRangeKeydown}
          />
        {:else}
          <input
            bind:this={startInput}
            id="{dropdownId}-start"
            type="number"
            placeholder="0"
            onmousedown={(e) => e.stopPropagation()}
            onkeydown={handleRangeKeydown}
          />
        {/if}
      </div>
      <div class="search-ac-range-field">
        <label for="{dropdownId}-end">{rangeConfig.endLabel}</label>
        {#if isDateField}
          <input
            bind:this={endInput}
            id="{dropdownId}-end"
            type="date"
            placeholder="YYYY-MM-DD"
            onmousedown={(e) => e.stopPropagation()}
            onkeydown={handleRangeKeydown}
          />
        {:else}
          <input
            bind:this={endInput}
            id="{dropdownId}-end"
            type="number"
            placeholder="∞"
            onmousedown={(e) => e.stopPropagation()}
            onkeydown={handleRangeKeydown}
          />
        {/if}
      </div>
      <button
        class="search-ac-insert-btn"
        type="button"
        onmousedown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleRangeInsert();
        }}
      >
        Insert
      </button>
    </div>
  {/if}
</div>

<style>
  .search-autocomplete {
    background-color: white;
    border: 1px solid var(--gray-2, #d0d7de);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    min-width: 180px;
    max-width: 280px;
    z-index: var(--z-dropdown, 100);
    padding: 4px 0;
  }

  .search-ac-range {
    max-height: none;
    overflow-y: visible;
  }

  .search-ac-section-label {
    padding: 4px 12px 2px;
    font-size: var(--font-xs, 12px);
    font-weight: 600;
    color: var(--gray-5, #6e7781);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .search-ac-separator {
    border: none;
    border-top: 1px solid var(--gray-2, #d0d7de);
    margin: 4px 0;
  }

  .search-ac-range-inputs {
    padding: 6px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .search-ac-range-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .search-ac-range-field label {
    font-size: var(--font-xs, 12px);
    color: var(--gray-5, #6e7781);
    font-weight: 500;
  }

  .search-ac-range-field input {
    font-size: var(--font-sm, 14px);
    padding: 4px 6px;
    border: 1px solid var(--gray-2, #d0d7de);
    border-radius: 4px;
    outline: none;
  }

  .search-ac-range-field input:focus {
    border-color: var(--blue-3, #0969da);
    box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.2);
  }

  .search-ac-option {
    display: flex;
    flex-direction: column;
    padding: 6px 12px;
    cursor: pointer;
    font-size: var(--font-sm, 14px);
    line-height: 1.4;
    gap: 1px;
  }

  .search-ac-option:hover,
  .search-ac-option.selected {
    background-color: var(--blue-0, #ddf4ff);
  }

  .search-ac-option[aria-selected="true"] {
    background-color: var(--blue-0, #ddf4ff);
  }

  .search-ac-label {
    font-weight: 500;
    color: var(--gray-9, #1f2328);
  }

  .search-ac-insert-btn {
    font-size: var(--font-sm, 14px);
    padding: 4px 12px;
    background: var(--blue-3, #0969da);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    align-self: flex-end;
  }

  .search-ac-insert-btn:hover {
    background: var(--blue-4, #0550ae);
  }
</style>
