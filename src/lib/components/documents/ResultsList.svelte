<script module lang="ts">
  import type { Document, DocumentResults, Maybe } from "$lib/api/types";
  import {
    derived,
    writable,
    type Readable,
    type Writable,
  } from "svelte/store";

  import {
    defaultVisibleFields,
    getVisibleFieldsContext,
    type VisibleFields,
  } from "./VisibleFields.svelte";

  // IDs might be strings or numbers, depending on the API endpoint
  // enforce type consistency here to avoid comparison bugs later
  export const visible: Writable<Map<string, Document>> = writable(new Map());
  export const selectedIds: Writable<string[]> = writable([]);
  export const selected: Readable<Document[]> = derived(
    [visible, selectedIds],
    ([$visible, $selectedIds]) =>
      $selectedIds.map((d) => $visible.get(d)).filter(Boolean) as Document[],
  );

  // this selection is editable if every document in it is editable
  export const editable: Readable<boolean> = derived(
    [selected],
    ([$selected]) =>
      $selected &&
      $selected?.length > 0 &&
      $selected?.every((d) => d.edit_access),
  );

  export let total: Writable<number> = writable(0);

  // Allow users to customize the visible fields in document list items
  const storage = new StorageManager("document-browser");
  const userDefaultVisible = storage.get<VisibleFields, VisibleFields>(
    "visibleFields",
    defaultVisibleFields,
  );
  export const visibleFields: Writable<VisibleFields> = writable(
    Object.assign({}, defaultVisibleFields, userDefaultVisible),
  );
  visibleFields.subscribe((val) => storage.set("visibleFields", val));

  // In order for the highlight state to be shared between components, we need to
  // create a writable store and set it in the context.
  export const highlightState: Writable<{ allOpen: boolean }> = writable({
    allOpen: true,
  });
</script>

<script lang="ts">
  import { getContext, onMount, setContext, type Snippet } from "svelte";
  import { _ } from "svelte-i18n";
  import { Search24 } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import DocumentListItem from "./DocumentListItem.svelte";
  import Empty from "../common/Empty.svelte";
  import Flex from "../common/Flex.svelte";
  import NoteHighlights from "./NoteHighlights.svelte";
  import PageHighlights from "./PageHighlights.svelte";

  import { getApiResponse } from "$lib/utils/api";
  import { StorageManager } from "$lib/utils/storage";

  interface Props {
    results?: Document[];
    count?: Maybe<number>;
    next?: string | null;
    auto?: boolean;
    preload?: "hover" | "tap";
    start?: Snippet;
    end?: Snippet;
  }

  let {
    results = $bindable([]),
    count = undefined,
    next = $bindable(null),
    auto = $bindable(false),
    preload = "hover",
    start,
    end,
  }: Props = $props();

  let container: Maybe<HTMLElement> = $state();
  let endEl: Maybe<HTMLElement> = $state();
  let error: string = $state("");
  let loading = $state(false);
  let observer: Maybe<IntersectionObserver>;

  const embed: boolean = getContext("embed");
  const visibleFields = getVisibleFieldsContext();

  setContext("highlightState", highlightState);

  function collapseAll() {
    highlightState.update((state) => ({ ...state, allOpen: false }));
  }

  function expandAll() {
    highlightState.update((state) => ({ ...state, allOpen: true }));
  }

  // track what's visible so we can compare to $selected
  $effect(() => {
    $visible = new Map(results.map((d) => [String(d.id), d]));
  });

  // load the next set of results
  async function load(url: string | URL) {
    try {
      url = new URL(url);
    } catch (e) {
      error = e.message;
      loading = false;
      return console.warn(e);
    }

    // only one at a time
    if (loading) return;

    loading = true;
    const resp = await fetch(url, { credentials: "include" }).catch(
      console.warn,
    );

    const { data, error: err } = await getApiResponse<DocumentResults>(resp);

    if (err) {
      // show an error message, but let the user try loading more
      error = err.message;
      auto = false;
      loading = false;
    }

    if (data) {
      results = [...results, ...data.results];
      $total = data.count ?? $total;
      next = data.next;
      error = "";
      if (auto && endEl) watch(endEl);
    }
    loading = false;
  }

  function watch(el: HTMLElement): Maybe<IntersectionObserver> {
    if (!el) return;
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting && next) {
          observer?.unobserve(el);
          await load(next).catch((e) => {
            loading = false;
            error = e.message;
          });
        }
      });
    });

    try {
      // sometimes this breaks, so just let the user click the button
      io.observe(el);
    } catch (e) {
      console.warn(e);
      auto = false; // turn off auto if IO is failing
    }
    return io;
  }

  function unwatch(io: IntersectionObserver, el?: HTMLElement) {
    if (el) {
      io?.unobserve(el);
    }
  }

  onMount(() => {
    // set initial total, update later
    $total = count ?? 0;
    if (auto && endEl) {
      observer = watch(endEl);
    }

    return () => {
      if (observer) {
        unwatch(observer, endEl);
      }
    };
  });
</script>

<div
  class="container"
  data-sveltekit-preload-data={preload}
  bind:this={container}
>
  <Flex direction="column" gap={1}>
    {@render start?.()}
    {#each results as document (document.id)}
      <div
        class="result-row"
        class:selected={$selectedIds.includes(String(document.id))}
      >
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
        <div class="result-content">
          <DocumentListItem {document} visibleFields={$visibleFields} />
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
        </div>
      </div>
    {:else}
      <Empty icon={Search24}>
        <h2>{$_("noDocuments.noSearchResults")}</h2>
        <p>{$_("noDocuments.queryNoResults")}</p>
      </Empty>
    {/each}
  </Flex>

  <div bind:this={endEl} class="end">
    {#if next}
      <Button
        ghost
        mode="primary"
        disabled={loading}
        on:click={() => {
          if (next)
            load(next).catch((e) => {
              error = e.message;
              loading = false;
            });
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

  {@render end?.()}
</div>

<style>
  .container {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .result-row {
    width: 100%;
    display: flex;
    gap: 0.625rem;
    align-items: flex-start;
    padding-bottom: 0.5rem;
  }

  .result-row.selected {
    background-color: var(--blue-1, #f0f0f0);
  }

  .result-content {
    flex: 1 1 auto;
    min-width: 0;
  }

  label {
    display: flex;
    align-items: center;
    align-self: center;
    gap: 0.5rem;
    padding-left: 0.5rem;
    margin-top: 0;
  }

  input[type="checkbox"] {
    margin: 0;
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
