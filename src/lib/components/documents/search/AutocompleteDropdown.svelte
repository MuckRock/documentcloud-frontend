<!--
  AutocompleteDropdown renders the autocomplete suggestion listbox.
  Positioned via @floating-ui/dom using pre-computed anchor coordinates.
-->
<script lang="ts">
  import type { Suggestion } from "./prosemirror/plugins/autocomplete-data";

  interface Props {
    suggestions?: Suggestion[];
    selectedIndex?: number;
    loading?: boolean;
    dropdownId: string;
    onSelect: (index: number) => void;
    onHover: (index: number) => void;
  }

  let {
    suggestions = [],
    selectedIndex = 0,
    loading = false,
    dropdownId,
    onSelect,
    onHover,
  }: Props = $props();

  let dropdown: HTMLElement | undefined = $state();
  let options: HTMLElement[] = $state([]);

  $effect(() => {
    // Always keep the selected element in view
    const el = options[selectedIndex];
    // Protect calling `scrollIntoView` in tests by checking if it's a function.
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  });

  /** Expose the dropdown element so the plugin can position it. */
  export function getElement(): HTMLElement | undefined {
    return dropdown;
  }
</script>

<div
  bind:this={dropdown}
  class="search-autocomplete"
  role="listbox"
  aria-label="Search suggestions"
  aria-busy={loading}
  id={dropdownId}
  style="position: absolute; display: none;"
>
  {#if suggestions.length === 0 && loading}
    <div class="search-ac-loading">Loading…</div>
  {:else}
    {#each suggestions as suggestion, index}
      <div
        bind:this={options[index]}
        class="search-ac-option"
        class:selected={index === selectedIndex}
        role="option"
        tabindex="-1"
        id="{dropdownId}-opt-{index}"
        aria-selected={index === selectedIndex}
        aria-label={suggestion.description
          ? `${suggestion.label}, ${suggestion.description}`
          : suggestion.label}
        onmousedown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect(index);
        }}
        onmouseenter={() => onHover(index)}
      >
        <span class="search-ac-label">{suggestion.label}</span>
        {#if suggestion.description}
          <span class="search-ac-description">{suggestion.description}</span>
        {/if}
      </div>
    {/each}
    {#if loading}
      <div class="search-ac-loading">Loading…</div>
    {/if}
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
    max-height: 16rem;
    overflow-y: auto;
    overscroll-behavior: contain;
    z-index: var(--z-dropdown, 100);
    padding: 4px 0;
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
    background-color: var(--blue-1, #ddf4ff);
  }

  .search-ac-option[aria-selected="true"] {
    background-color: var(--blue-1, #ddf4ff);
  }

  .search-ac-label {
    font-weight: 500;
    color: var(--gray-5, #1f2328);
  }

  .search-ac-description {
    font-size: var(--font-xs, 12px);
    color: var(--gray-4, #6e7781);
  }

  .search-ac-loading {
    padding: 6px 12px;
    color: var(--gray-3, #6e7781);
    font-style: italic;
    font-size: var(--font-sm, 14px);
  }
</style>
