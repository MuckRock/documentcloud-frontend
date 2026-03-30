<script lang="ts">
  import type { Component } from "svelte";
  import type { SvgComponent } from "svelte-octicons";

  interface Props {
    key: string;
    icon?: Component | typeof SvgComponent;
    children?: import("svelte").Snippet;
  }

  let { key, icon: Icon, children }: Props = $props();
</script>

<div class="metadata">
  {#if Icon}<Icon />{/if}
  <dl class="text">
    <dt>{key}</dt>
    <dd>{@render children?.()}</dd>
  </dl>
</div>

<style>
  .metadata {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 0.125em 1rem;
  }

  dt {
    font-size: var(--font-xs);
    color: var(--gray-4);
    text-transform: lowercase;
    white-space: nowrap;
  }
  dd {
    font-size: var(--font-sm);
  }
</style>
