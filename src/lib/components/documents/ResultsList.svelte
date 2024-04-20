<script context="module" lang="ts">
  import { writable, type Writable } from "svelte/store";

  // IDs might be strings or numbers, depending on the API endpoint
  // enforce type consistency here to avoid comparison bugs later
  export const selected: Writable<string[]> = writable([]);
  export let visible: Writable<Set<string>> = writable(new Set());

  export let total: Writable<number> = writable(0);
</script>

<script lang="ts">
  import type { Document, DocumentResults } from "$lib/api/types";

  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { Search24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import DocumentListItem from "./DocumentListItem.svelte";
  import Empty from "../common/Empty.svelte";
  import Flex from "../common/Flex.svelte";
  import SearchHighlights from "./SearchHighlights.svelte";

  export let results: Document[] = [];
  export let count: number = undefined;
  export let next: string | null = null;
  export let auto = false;

  let loading = false;
  let end: HTMLElement;
  let observer: IntersectionObserver;

  // track what's visible so we can compare to $selected
  $: $visible = new Set(results.map((d) => String(d.id)));

  // load the next set of results
  async function load(url: URL) {
    loading = true;
    const res = await fetch(url, { credentials: "include" });

    if (!res.ok) {
      // todo: better error handling
      console.error(res.statusText);
      loading = false;
    }

    const r: DocumentResults = await res.json();

    results = [...results, ...r.results];
    $total = r.count;
    next = r.next;
    loading = false;
    if (auto) watch(end);
  }

  function watch(el: HTMLElement) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting && next) {
          await load(new URL(next));
          observer.unobserve(el);
        }
      });
    });

    io.observe(el);
    return io;
  }

  function unwatch(io: IntersectionObserver, el: HTMLElement) {
    io.unobserve(el);
  }

  onMount(() => {
    // set initial total, update later
    $total = count;
    if (auto) {
      observer = watch(end);
    }

    return () => {
      unwatch(observer, end);
    };
  });
</script>

<div class="container">
  {#each results as document (document.id)}
    <Flex gap={0.625} align="center">
      <label>
        <span class="sr-only">Select</span>
        <input
          type="checkbox"
          bind:group={$selected}
          value={String(document.id)}
        />
      </label>
      <DocumentListItem {document} />

      <SearchHighlights {document} highlights={document.highlights} />
    </Flex>
  {:else}
    <Empty icon={Search24}>
      <h2>{$_("noDocuments.noSearchResults")}</h2>
      <p>{$_("noDocuments.queryNoResults")}</p>
    </Empty>
  {/each}
  <div bind:this={end} class="end">
    {#if next}
      <Button
        mode="ghost"
        disabled={loading}
        on:click={(e) => load(new URL(next))}
      >
        {#if loading}
          Loading &hellip;
        {:else}
          Load more
        {/if}
      </Button>
    {/if}
  </div>
</div>

<style>
  .container {
    padding: 0 2rem;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  input[type="checkbox"] {
    height: 1.25rem;
    width: 1.25rem;
  }

  .end {
    display: flex;
    justify-content: center;
  }
</style>
