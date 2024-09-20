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
  import { remToPx } from "@/lib/utils/layout";

  export let trail: Breadcrumb[] = [];

  let width: number;
  $: BREAKPOINTS = {
    SHOW_BREADCRUMBS: width > remToPx(32),
  };
</script>

<div class="breadcrumbs" bind:clientWidth={width}>
  <Flex gap={0.375} align="center">
    <slot name="root">
      <a href="/" class="logo crumb"><Logo /></a>
    </slot>
    {#if BREAKPOINTS.SHOW_BREADCRUMBS}
      {#each trail as { href, title }}
        <span class="divider"><TriangleRight16 fill="var(--gray-3)" /></span>
        {#if href}
          <a class="crumb" {href} {title}>{title}</a>
        {:else}
          <span {title} class="crumb">{title}</span>
        {/if}
      {/each}
    {/if}
  </Flex>
</div>

<style>
  .breadcrumbs {
    flex: 1 0 0;
    max-width: 100%;
    overflow: hidden;
  }

  .divider {
    display: flex;
    align-items: center;
  }

  .crumb {
    flex: 0 1 auto;
    font-size: var(--font-md);
    font-weight: var(--font-semibold);
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
