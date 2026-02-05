<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SvgComponent } from "svelte-octicons";

  interface Props {
    icon?: null | typeof SvgComponent;
    children?: Snippet;
  }

  let { icon: Icon = null, children }: Props = $props();
</script>

<div class="container">
  {#if Icon}
    <Icon height="32" width="32" />
  {/if}
  {@render children?.()}
</div>

<style>
  .container {
    display: flex;
    padding: var(--padding, 1.5rem);
    flex: 1 0 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    color: var(--color, var(--gray-4, #99a8b3));
    fill: var(--fill, var(--gray-3, #99a8b3));

    text-align: center;
    font-size: var(--font-size, var(--font-sm, 0.875rem));
  }
</style>
