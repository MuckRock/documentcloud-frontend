<!--
  ChipEditor: A popover for editing chip modifiers (required/excluded, boost, delete).
  Anchored to a chip element using @floating-ui/dom.
-->
<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { computePosition, flip, offset, shift } from "@floating-ui/dom";

  /** The chip's current prefix: "+", "-", or null */
  export let prefix: string | null = null;

  /** The chip's current boost value (field-value only, null for range) */
  export let boost: number | null = null;

  /** Whether to show the boost control */
  export let showBoost: boolean = true;

  /** The DOM element to anchor the popover to */
  export let anchor: HTMLElement;

  /** Callback when prefix changes */
  export let onPrefixChange: (prefix: string | null) => void;

  /** Callback when boost changes */
  export let onBoostChange: ((boost: number | null) => void) | null = null;

  /** Callback to delete the chip */
  export let onDelete: () => void;

  /** Callback when the popover should close */
  export let onClose: () => void;

  /** Callback to return focus to the editor */
  export let onFocusEditor: () => void;

  let popover: HTMLElement;

  /** Focus the popover container (called externally via ArrowDown). */
  export function focus() {
    popover?.focus();
  }

  $: isRequired = prefix === "+";
  $: isExcluded = prefix === "-";

  function toggleRequired() {
    onPrefixChange(isRequired ? null : "+");
  }

  function toggleExcluded() {
    onPrefixChange(isExcluded ? null : "-");
  }

  function incrementBoost() {
    const next = (boost ?? 1) + 1;
    onBoostChange?.(next);
  }

  function decrementBoost() {
    const current = boost ?? 1;
    if (current <= 1) {
      onBoostChange?.(null);
    } else {
      onBoostChange?.(current - 1);
    }
  }

  function handleDelete() {
    onDelete();
    onClose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      onFocusEditor();
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (popover && !popover.contains(e.target as Node) && !anchor.contains(e.target as Node)) {
      onClose();
    }
  }

  async function position() {
    if (!popover || !anchor) return;
    try {
      const { x, y } = await computePosition(anchor, popover, {
        placement: "bottom-start",
        middleware: [offset(4), flip(), shift({ padding: 8 })],
      });
      // popover may have been destroyed while awaiting
      if (popover) {
        popover.style.left = `${x}px`;
        popover.style.top = `${y}px`;
      }
    } catch {
      // computePosition unavailable in test environments
    }
  }

  onMount(async () => {
    await tick();
    position();
    document.addEventListener("mousedown", handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener("mousedown", handleClickOutside);
  });
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
  bind:this={popover}
  class="chip-editor"
  role="dialog"
  aria-label="Edit chip"
  tabindex="0"
  on:keydown={handleKeydown}
>
  <div class="chip-editor-row">
    <button
      class="chip-editor-toggle"
      class:active={isRequired}
      aria-pressed={isRequired}
      on:click={toggleRequired}
      title="Require (+)"
    >
      + Require
    </button>
    <button
      class="chip-editor-toggle"
      class:active={isExcluded}
      aria-pressed={isExcluded}
      on:click={toggleExcluded}
      title="Exclude (-)"
    >
      - Exclude
    </button>
  </div>

  {#if showBoost && onBoostChange}
    <div class="chip-editor-row chip-editor-boost">
      <span class="chip-editor-label">Boost</span>
      <div class="chip-editor-stepper">
        <button
          class="chip-editor-step-btn"
          on:click={decrementBoost}
          aria-label="Decrease boost"
        >-</button>
        <span class="chip-editor-boost-value">{boost ?? "—"}</span>
        <button
          class="chip-editor-step-btn"
          on:click={incrementBoost}
          aria-label="Increase boost"
        >+</button>
      </div>
    </div>
  {/if}

  <hr class="chip-editor-separator" />

  <button class="chip-editor-delete" on:click={handleDelete}>
    Delete
  </button>
</div>

<style>
  .chip-editor {
    position: fixed;
    background-color: white;
    border: 1px solid var(--gray-2, #d0d7de);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    padding: 8px;
    z-index: var(--z-dropdown, 100);
    min-width: 160px;
    outline: none;
  }

  .chip-editor:focus-visible {
    border-color: var(--blue-3, #0969da);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      0 0 0 2px rgba(9, 105, 218, 0.2);
  }

  .chip-editor-row {
    display: flex;
    gap: 4px;
    margin-bottom: 4px;
  }

  .chip-editor-toggle {
    flex: 1;
    padding: 4px 8px;
    font-size: var(--font-sm, 14px);
    border: 1px solid var(--gray-2, #d0d7de);
    border-radius: 4px;
    background: white;
    cursor: pointer;
    text-align: center;
  }

  .chip-editor-toggle:hover {
    background: var(--gray-0, #f6f8fa);
  }

  .chip-editor-toggle.active {
    background: var(--blue-0, #ddf4ff);
    border-color: var(--blue-3, #0969da);
    color: var(--blue-3, #0969da);
    font-weight: 500;
  }

  .chip-editor-boost {
    align-items: center;
    justify-content: space-between;
  }

  .chip-editor-label {
    font-size: var(--font-sm, 14px);
    color: var(--gray-5, #6e7781);
  }

  .chip-editor-stepper {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .chip-editor-step-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--gray-2, #d0d7de);
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: var(--font-sm, 14px);
    font-weight: 600;
  }

  .chip-editor-step-btn:hover {
    background: var(--gray-0, #f6f8fa);
  }

  .chip-editor-boost-value {
    min-width: 20px;
    text-align: center;
    font-size: var(--font-sm, 14px);
    font-weight: 500;
  }

  .chip-editor-separator {
    border: none;
    border-top: 1px solid var(--gray-2, #d0d7de);
    margin: 4px 0;
  }

  .chip-editor-delete {
    width: 100%;
    padding: 4px 8px;
    font-size: var(--font-sm, 14px);
    border: none;
    border-radius: 4px;
    background: none;
    cursor: pointer;
    color: var(--red-3, #d1242f);
    text-align: left;
  }

  .chip-editor-delete:hover {
    background: var(--red-0, #ffebe9);
  }
</style>
