<script lang="ts">
  export let active = false;
  export let disabled = false;
</script>

<div class="tab" class:active class:disabled>
  <button on:click {disabled}>
    <slot />
  </button>
</div>

<style>
  .tab {
    display: flex;
    padding: 0.25rem;
    align-items: center;
    border-bottom: 2px solid transparent;
  }
  .tab.active {
    border-bottom: 2px solid var(--active-color, var(--blue-3, #4294F0));
  }
  .tab.disabled {
    pointer-events: none;
    opacity: .7;
  }
  button {
    /* Reset button appearance */
    appearance: none;
    border: none;
    background: none;
    border-radius: .25em;
    cursor: pointer;
    /* Reset button typography */
    font-family: var(--font-sans);
    font-size: var(--font-md);
    font-weight: var(--font-semibold);
    font-feature-settings: 'ss04' on;
    display: flex;
    padding: 0.25rem 0.5rem;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-color, var(--gray-4, #5C717C));
    fill: var(--icon-color, var(--gray-3, #99A8B3));
  }
  button:hover, button:focus {
    background: var(--background-color, var(--blue-1, #EEF3F9));
  }
</style>