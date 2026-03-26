<!--
  AtomEditor is a popover for editing atom modifiers (required/excluded, boost, delete).
  It's anchored to an atom element using @floating-ui/dom.
-->
<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { computePosition, flip, offset, shift } from "@floating-ui/dom";
  import { ArrowDown16, ArrowUp16 } from "svelte-octicons";
  import Button from "$lib/components/common/Button.svelte";

  interface Props {
    prefix?: "+" | "-" | null;
    boost?: number | null;
    showBoost?: boolean;
    anchor: HTMLElement; // DOM element to anchor the popover to
    onPrefixChange: (prefix: string | null) => void;
    onBoostChange?: ((boost: number | null) => void) | null;
    onDelete: () => void;
    onClose: () => void;
    onFocusEditor: () => void;
  }

  let {
    prefix = null,
    boost = null,
    showBoost = true,
    anchor,
    onPrefixChange,
    onBoostChange = null,
    onDelete,
    onClose,
    onFocusEditor,
  }: Props = $props();

  let popover: HTMLElement | undefined = $state();

  /** A helper to focus the popover container from the SearchEditor */
  export function focus() {
    popover?.focus();
  }

  let isRequired = $derived(prefix === "+");
  let isExcluded = $derived(prefix === "-");

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
    if (current <= 2) {
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
    } else if (e.key === "Tab" && popover) {
      // Return focus to the editor when tabbing past the boundaries
      const focusable = Array.from(
        popover.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex="0"], input:not([disabled])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey) {
        // Tabbing backwards
        if (
          document.activeElement === first ||
          document.activeElement === popover
        ) {
          e.preventDefault();
          onFocusEditor();
        }
      } else {
        // Tabbing forwards
        if (document.activeElement === last) {
          e.preventDefault();
          onFocusEditor();
        }
      }
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (
      popover &&
      !popover.contains(e.target as Node) &&
      !anchor.contains(e.target as Node)
    ) {
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

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  bind:this={popover}
  class="atom-editor"
  role="dialog"
  aria-label="Edit atom"
  tabindex="0"
  onkeydown={handleKeydown}
>
  <div class="atom-editor-row">
    <Button
      small
      premium
      ghost
      minW={false}
      hover={isRequired}
      aria-pressed={isRequired}
      onclick={toggleRequired}
      title="Require"
    >
      Require
    </Button>
    <Button
      small
      danger
      ghost
      minW={false}
      hover={isExcluded}
      aria-pressed={isExcluded}
      onclick={toggleExcluded}
      title="Exclude"
    >
      Exclude
    </Button>
  </div>

  {#if showBoost && onBoostChange}
    <div class="atom-editor-row atom-editor-boost">
      <span class="atom-editor-label">Boost</span>
      <div class="atom-editor-stepper">
        <Button
          small
          ghost
          primary
          minW={false}
          onclick={decrementBoost}
          aria-label="Decrease boost"
          disabled={boost === null || boost <= 1}
        >
          <ArrowDown16 />
        </Button>
        <span class="atom-editor-boost-value">{boost ?? "1"}</span>
        <Button
          small
          ghost
          primary
          minW={false}
          onclick={incrementBoost}
          aria-label="Increase boost"
        >
          <ArrowUp16 />
        </Button>
      </div>
    </div>
  {/if}

  <hr class="atom-editor-separator" />

  <Button mode="danger" size="small" ghost full on:click={handleDelete}>
    Remove
  </Button>
</div>

<style>
  .atom-editor {
    font-family: var(--font-sans);
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

  .atom-editor:focus-visible {
    border-color: var(--blue-3, #0969da);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.12),
      0 0 0 2px rgba(9, 105, 218, 0.2);
  }

  .atom-editor-row {
    display: flex;
    gap: 4px;
    margin-bottom: 4px;
  }

  .atom-editor-boost {
    align-items: center;
    justify-content: space-between;
  }

  .atom-editor-label {
    font-size: var(--font-sm, 14px);
    font-weight: var(--font-semibold, 600);
    color: var(--gray-5, #6e7781);
  }

  .atom-editor-stepper {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .atom-editor-boost-value {
    min-width: 20px;
    text-align: center;
    font-size: var(--font-sm, 14px);
    font-weight: 600;
  }

  .atom-editor-separator {
    border: none;
    border-top: 1px solid var(--gray-2, #d0d7de);
    margin: 4px 0;
  }
</style>
