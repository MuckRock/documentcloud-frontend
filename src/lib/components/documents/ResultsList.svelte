<script context="module" lang="ts">
  import type { Document, DocumentResults, Maybe } from "$lib/api/types";
  import {
    derived,
    writable,
    type Readable,
    type Writable,
  } from "svelte/store";

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

  // In order for the highlight state to be shared between components, we need to
  // create a writable store and set it in the context.
  export const highlightState: Writable<{ allOpen: boolean }> = writable({
    allOpen: true,
  });
</script>

<script lang="ts">
  import { getContext, onMount, setContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { Search24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import DocumentListItem from "./DocumentListItem.svelte";
  import Empty from "../common/Empty.svelte";
  import Flex from "../common/Flex.svelte";
  import NoteHighlights from "./NoteHighlights.svelte";
  import PageHighlights from "./PageHighlights.svelte";

  import { getApiResponse } from "$lib/utils/api";

  export let results: Document[] = [];
  export let count: Maybe<number> = undefined;
  export let next: string | null = null;
  export let auto = false;
  export let preload: "hover" | "tap" = "hover";

  let loading = false;
  let end: HTMLElement;
  let observer: IntersectionObserver;
  let error: string = "";

  const embed: boolean = getContext("embed");

  setContext("highlightState", highlightState);
  function collapseAll() {
    highlightState.update((state) => ({ ...state, allOpen: false }));
  }
  function expandAll() {
    highlightState.update((state) => ({ ...state, allOpen: true }));
  }

  // track what's visible so we can compare to $selected
  $: $visible = new Map(results.map((d) => [String(d.id), d]));

  // load the next set of results
  async function load(url: URL) {
    loading = true;
    const resp = await fetch(url, { credentials: "include" }).catch(
      console.error,
    );

    const { data, error: err } = await getApiResponse<DocumentResults>(resp);

    if (err) {
      // show an error message, but let the user try loading more
      error = err.message;
    }

    if (data) {
      results = [...results, ...data.results];
      $total = data.count ?? $total;
      next = data.next;
      if (auto) watch(end);
    }

    loading = false;
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
            <PageHighlights
              {document}
              on:collapseAll={collapseAll}
              on:expandAll={expandAll}
            />
          {/if}
          {#if document.note_highlights}
            <NoteHighlights
              {document}
              on:collapseAll={collapseAll}
              on:expandAll={expandAll}
            />
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
          {$_("common.loading")}
        {:else}
          {$_("documents.more")}
        {/if}
      </Button>
    {/if}

    {#if error}
      <p class="error">{error}</p>
      <p class="error">{$_("documents.retry")}</p>
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
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .error {
    text-align: center;
    color: var(--error, red);
  }
</style>
