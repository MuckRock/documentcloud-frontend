<script lang="ts">
  import { ChevronDown16 } from "svelte-octicons";

  export let collapsed = false;
  export let toggle: (collapsed: boolean) => void = null;
</script>

<header
  class="container"
  role="button"
  tabindex={0}
  on:click={() => toggle?.(collapsed)}
  on:keydown={() => toggle?.(collapsed)}
>
  <span class="indicator" class:collapsed>
    <ChevronDown16 />
  </span>
  <slot />
  <slot name="action" />
</header>

<style>
  .container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: default;
  }
  .indicator {
    height: 1rem;
    width: 1rem;
    transition: transform 0.125s ease-in-out;
  }
  .indicator.collapsed {
    transform: rotate(-90deg);
  }
</style>
