<script context="module" lang="ts">
  import {
    derived,
    writable,
    type Readable,
    type Writable,
  } from "svelte/store";
  import type { Document, DocumentResults, Maybe } from "$lib/api/types";

  // IDs might be strings or numbers, depending on the API endpoint
  // enforce type consistency here to avoid comparison bugs later
  export const visible: Writable<Map<string, Document>> = writable(new Map());
  export const selectedIds: Writable<string[]> = writable([]);
  export const selected: Readable<Document[]> = derived(
    [visible, selectedIds],
    ([$visible, $selectedIds]) =>
      $selectedIds.map((d) => $visible.get(d)).filter(Boolean) as Document[],
  );

  export let total: Writable<number> = writable(0);
</script>

<script lang="ts">
  import { getContext, onMount } from "svelte";
  import { _ } from "svelte-i18n";
  import { Search24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import DocumentListItem from "./DocumentListItem.svelte";
  import Empty from "../common/Empty.svelte";
  import Flex from "../common/Flex.svelte";
  import NoteHighlights from "./NoteHighlights.svelte";
  import PageHighlights from "./PageHighlights.svelte";

  export let results: Document[] = [];
  export let count: Maybe<number> = undefined;
  export let next: string | null = null;
  export let auto = false;
  export let preload: "hover" | "tap" = "hover";

  let loading = false;
  let end: HTMLElement;
  let observer: IntersectionObserver;

  const embed: boolean = getContext("embed");

  // track what's visible so we can compare to $selected
  $: $visible = new Map(results.map((d) => [String(d.id), d]));

  // load the next set of results
  async function load(url: URL) {
    loading = true;
    const res = await fetch(url, { credentials: "include" }).catch(
      console.error,
    );

    // todo: better error handling
    if (!res) return console.error("API error");
    if (!res.ok) {
      console.error(res.statusText);
      loading = false;
    }

    const r: DocumentResults = await res.json();

    results = [...results, ...r.results];
    $total = r.count ?? $total;
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
    $total = count ?? 0;
    if (auto) {
      observer = watch(end);
    }

    return () => {
      unwatch(observer, end);
    };
  });
</script>

<div class="container" data-sveltekit-preload-data={preload}>
  <Flex direction="column">
    <slot name="start" />
    {#each results as document (document.id)}
      <Flex gap={0.625} align="center">
        {#if !embed}
          <label>
            <span class="sr-only">{$_("documents.select")}</span>
            <input
              type="checkbox"
              bind:group={$selectedIds}
              value={document.id}
            />
          </label>
        {/if}
        <DocumentListItem {document} />
      </Flex>

      {#if document.highlights}
        <PageHighlights {document} />
      {/if}

      {#if document.note_highlights}
        <NoteHighlights {document} />
      {/if}
    {:else}
      <Empty icon={Search24}>
        <h2>{$_("noDocuments.noSearchResults")}</h2>
        <p>{$_("noDocuments.queryNoResults")}</p>
      </Empty>
    {/each}
  </Flex>

  <div bind:this={end} class="end">
    {#if next}
      <Button
        ghost
        mode="primary"
        disabled={loading}
        on:click={() => {
          if (next) load(new URL(next));
        }}
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
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-left: 0.5rem;
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
