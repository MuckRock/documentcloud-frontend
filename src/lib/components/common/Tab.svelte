<!-- @component
A tab component for navigating within a page.
Note that links will preserve querystrings where possible.
-->
<script lang="ts">
  import { qs } from "$lib/utils/navigation";

  export let active = false;
  export let disabled = false;
  export let href: string = "";
</script>

<div class="tab" role="tab" class:active class:disabled>
  {#if href}
    <a {href} class:disabled use:qs>
      <slot />
    </a>
  {:else}
    <button on:click {disabled}>
      <slot />
    </button>
  {/if}
</div>

<style>
  .tab {
    display: flex;
    padding: 0.25rem;
    align-items: center;
    border-bottom: 2px solid transparent;
  }
  .tab.active {
    border-bottom: 2px solid var(--active-color, var(--blue-3, #4294f0));
  }
  .tab.disabled {
    pointer-events: none;
    opacity: 0.7;
  }
  button,
  a {
    /* Reset button appearance */
    appearance: none;
    border: none;
    background: none;
    border-radius: 0.25em;
    cursor: pointer;
    /* Reset button typography */
    font-family: var(--font-sans);
    font-size: var(--font-md);
    font-weight: var(--font-semibold);
    font-feature-settings: "ss04" on;
    text-decoration: none;
    display: flex;
    padding: 0.25rem 0.5rem;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-color, var(--gray-4, #5c717c));
    fill: var(--icon-color, var(--gray-3, #99a8b3));
  }
  button:hover,
  button:focus,
  a:hover,
  a:focus {
    background: var(--background-color, var(--blue-1, #eef3f9));
  }
</style>
