<script module lang="ts">
  import { writable, type Writable } from "svelte/store";
  import type { Maybe } from "$lib/api/types";

  import {
    defaultVisibleFields,
    getVisibleFieldsContext,
    type VisibleFields,
  } from "./VisibleFields.svelte";

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

  import { StorageManager } from "$lib/utils/storage";
  import { SearchResultsState } from "$lib/state/search.svelte";

  interface Props {
    search: SearchResultsState;
    auto?: boolean;
    preload?: "hover" | "tap";
    start?: Snippet;
    end?: Snippet;
    onNext?: () => Promise<Maybe<string>>; // can return an error
  }

  let {
    auto = $bindable(false),
    preload = "hover",
    start,
    end,
    onNext: onNextProp,
    search,
  }: Props = $props();

  let endEl: Maybe<HTMLElement> = $state();
  let error: Maybe<string> = $state();
  let observer: Maybe<IntersectionObserver>;

  // we can pass in an onNext callback or ust use the SearchResultsState
  // this is likely just for testing and storybook, and may go away if we don't need it
  let onNext = $derived(onNextProp ?? search.loadNext);

  const embed: boolean = getContext("embed");
  const visibleFields = getVisibleFieldsContext();

  setContext("highlightState", highlightState);

  function collapseAll() {
    highlightState.update((state) => ({ ...state, allOpen: false }));
  }

  function expandAll() {
    highlightState.update((state) => ({ ...state, allOpen: true }));
  }

  function watch(el: HTMLElement): Maybe<IntersectionObserver> {
    if (!el) return;
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting && search.next) {
          observer?.unobserve(el);
          error = await onNext();
          if (error) {
            // don't keep trying if something fails
            auto = false;
          }
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

<div class="container" data-sveltekit-preload-data={preload}>
  <Flex direction="column" gap={1}>
    {@render start?.()}
    {#each search.visible.values() as document (document.id)}
      <div
        class="result-row"
        class:selected={search.selectedIds.has(String(document.id))}
      >
        {#if !embed}
          <label>
            <span class="sr-only">{$_("documents.select")}</span>
            <input
              type="checkbox"
              checked={search.selectedIds.has(String(document.id))}
              onchange={(e) => {
                const id = String(document.id);
                if (e.currentTarget.checked) {
                  search.selectedIds.add(id);
                } else {
                  search.selectedIds.delete(id);
                }
              }}
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
    {#if search.next}
      <Button
        ghost
        mode="primary"
        disabled={search.loading}
        on:click={async () => {
          error = await onNext();
        }}
      >
        {#if search.loading}
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
