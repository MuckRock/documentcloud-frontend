<script lang="ts">
  import type { SvgComponent } from "svelte-octicons";

  export let icon: typeof SvgComponent = null;
</script>

<div class="container">
  {#if icon}<svelte:component this={icon} height="32" width="32" />{/if}
  <slot />
</div>

<style>
  .container {
    display: flex;
    padding: 1.5rem;
    flex: 1 0 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--gray-4, #99a8b3);
    fill: var(--gray-3, #99a8b3);

    text-align: center;
    font-size: var(--font-sm, 0.875rem);
  }
</style>
