<script lang="ts" context="module">
  export interface Breadcrumb {
    title: string;
    href?: string;
  }
</script>

<script lang="ts">
  import { TriangleRight16 } from "svelte-octicons";
  import Logo from "../common/Logo.svelte";
  import Flex from "../common/Flex.svelte";

  export let trail: Breadcrumb[] = [];
</script>

<div class="breadcrumbs">
  <Flex gap={0.375} align="center">
    <slot name="root">
      <a href="/app" class="logo crumb"><Logo /></a>
    </slot>
    {#each trail as { href, title }}
      <span class="divider"><TriangleRight16 fill="var(--gray-3)" /></span>
      {#if href}
        <a class="crumb" {href} {title}>{title}</a>
      {:else}
        <span {title} class="crumb">{title}</span>
      {/if}
    {/each}
  </Flex>
</div>

<style>
  .breadcrumbs {
    flex: 1 0 0;
    max-width: 100%;
  }

  .crumb {
    flex: 0 1 auto;
    font-size: var(--font-l);
    text-decoration: none;
    color: var(--gray-4);
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .crumb:last-child {
    color: inherit;
    flex: 0 0 auto;
  }

  a.crumb:hover {
    background: var(--gray-1);
  }

  .logo {
    flex: 0 0 auto;
    height: 1.5rem;
    width: auto;
    box-sizing: content-box;
  }
</style>
