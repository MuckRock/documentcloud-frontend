<script lang="ts">
  import type { SvgComponent } from "svelte-octicons";

  export let icon: typeof SvgComponent = null;
</script>

<span
  class="container"
  role="button"
  tabindex={0}
  on:click|stopPropagation
  on:keydown|stopPropagation
>
  {#if icon}<svelte:component this={icon} height="14" width="14" />{/if}
  <slot />
</span>

<style>
  .container {
    display: inline-flex;
    padding: 0.25rem 0.5rem;
    justify-content: center;
    align-items: center;
    gap: 0.375rem;

    border-radius: 0.5rem;

    background: transparent;
    color: var(--primary, --blue-3, #4294f0);
    fill: var(--primary, --blue-3, #4294f0);

    font-size: var(--font-xs, 0.75rem);
    font-weight: var(--font-bold, 700);
    line-height: normal;
    text-transform: uppercase;

    cursor: pointer;
  }

  .container:hover {
    background: var(--blue-1, #eef3f9);
  }
  @media (hover: none) {
    .container:hover {
      background: transparent;
    }
  }
</style>
