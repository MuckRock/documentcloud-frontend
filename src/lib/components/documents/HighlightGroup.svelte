<!-- @component A collection of highlights from search results.-->

<script lang="ts" generics="H">
  import type { Snippet } from "svelte";
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import {
    ChevronDown12,
    ChevronRight12,
    Fold16,
    Unfold16,
  } from "svelte-octicons";

  import { remToPx } from "$lib/utils/layout";
  import Button from "../common/Button.svelte";

  interface Props {
    open?: boolean;
    highlights?: [string, H][];
    getHref: (id: string) => string;
    showAll?: boolean;
    summary?: Snippet;
    children?: Snippet<[any]>;
  }

  let {
    open = $bindable(false),
    highlights = [],
    getHref,
    showAll = false,
    summary,
    children,
  }: Props = $props();

  let clientWidth = $state(1000);
  let isSmall = $derived(clientWidth < remToPx(27));

  const dispatch = createEventDispatcher();

  function collapseAll() {
    open = false;
    dispatch("collapseAll");
  }

  function expandAll() {
    open = true;
    dispatch("expandAll");
  }
</script>

{#if highlights.length}
  <details class="highlights" bind:open bind:clientWidth>
    <summary>
      <div class="left">
        {#if open}
          <ChevronDown12 />
        {:else}
          <ChevronRight12 />
        {/if}
        {#if summary}{@render summary()}{:else}
          {$_("search.matchingResults", { values: { n: highlights.length } })}
        {/if}
      </div>
      {#if showAll}
        <div class="right">
          {#if open}
            <Button
              minW={false}
              size="small"
              ghost
              on:click={collapseAll}
              title={$_("search.collapseAll")}
            >
              <Fold16 height={14} width={14} />
              {#if !isSmall}{$_("search.collapseAll")}{/if}
            </Button>
          {:else}
            <Button
              minW={false}
              size="small"
              ghost
              on:click={expandAll}
              title={$_("search.expandAll")}
            >
              <Unfold16 height={14} width={14} />
              {#if !isSmall}{$_("search.expandAll")}{/if}
            </Button>
          {/if}
        </div>
      {/if}
    </summary>
    <ul>
      {#each highlights as [id, highlight]}
        <li>
          <a class="highlight" href={getHref(id)}>
            {@render children?.({ id, highlight })}
          </a>
        </li>
      {/each}
    </ul>
  </details>
{/if}

<style>
  .highlights {
    border-radius: 0.25rem;
    overflow: hidden;
  }
  .highlights summary {
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
    gap: 1rem;
    color: var(--gray-4);
    fill: var(--gray-4);
    padding: 0.5rem 0.75rem;
    font-size: var(--font-sm);
    font-weight: var(--font-semibold);
  }
  .highlights summary .left,
  .highlights summary .right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: no-wrap;
    padding: 0 0.5rem 0 0.25rem;
    border-radius: 0.5rem;
  }
  summary .left:hover,
  summary .left:focus,
  summary:hover .left,
  summary:focus .left {
    background-color: var(--blue-1);
  }
  .highlights ul {
    list-style-type: none;
    padding: 0;
    margin: 0 0.5rem;
    border: 1px solid var(--gray-1);
    border-radius: 0.25rem;
    background: var(--white);
    overflow: hidden;
  }
  .highlights li {
    border-top: 1px solid var(--gray-1);
  }
  .highlights li:first-child {
    border-top: none;
  }
  .highlight {
    display: block;
    padding: 0.5rem 0.75rem;
    background: var(--white);
    text-decoration: none;
    color: inherit;
  }
  .highlight:hover,
  .highlight:focus {
    background: var(--blue-1);
  }
</style>
