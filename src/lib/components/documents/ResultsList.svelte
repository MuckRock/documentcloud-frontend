<script context="module" lang="ts">
  import { writable, type Writable } from "svelte/store";
  import type { Document, DocumentResults } from "$lib/api/types";

  // IDs might be strings or numbers, depending on the API endpoint
  // enforce type consistency here to avoid comparison bugs later
  export const selected: Writable<Document[]> = writable([]);
  export let visible: Writable<Set<Document>> = writable(new Set());

  export let total: Writable<number> = writable(0);
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { Search24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import DocumentListItem from "./DocumentListItem.svelte";
  import Empty from "../common/Empty.svelte";
  import Flex from "../common/Flex.svelte";
  import NoteHighlights from "./NoteHighlights.svelte";
  import SearchHighlights from "./SearchHighlights.svelte";

  export let results: Document[] = [];
  export let count: number = undefined;
  export let next: string | null = null;
  export let auto = false;
  export let preload: "hover" | "tap" = "hover";

  let loading = false;
  let end: HTMLElement;
  let observer: IntersectionObserver;

  // track what's visible so we can compare to $selected
  $: $visible = new Set(results);

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
          observer?.unobserve(el);
        }
      });
    });

    io.observe(el);
    return io;
  }

  function unwatch(io: IntersectionObserver, el: HTMLElement) {
    io?.unobserve(el);
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

<div class="container" data-sveltekit-preload-data={preload}>
  <slot name="start" />
  {#each results as document (document.id)}
    <Flex direction="column">
      <Flex gap={0.625} align="center">
        <label>
          <span class="sr-only">{$_("documents.select")}</span>
          <input type="checkbox" bind:group={$selected} value={document} />
        </label>
        <DocumentListItem {document} />
      </Flex>

      {#if document.highlights}
        <SearchHighlights {document} />
      {/if}

      {#if document.note_highlights}
        <NoteHighlights {document} />
      {/if}
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
        ghost
        mode="primary"
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

  <slot name="end" />
</div>

<style>
  .container {
    padding: 0 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
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
