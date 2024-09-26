<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { Document, ViewerMode } from "$lib/api/types";

  import { createEventDispatcher, onMount, getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import { pageHashUrl } from "$lib/api/documents";
  import { replaceState } from "$app/navigation";
  import { getViewerHref, isEmbedded } from "@/lib/utils/viewer";

  export let document: Document;
  export let page_number: number;
  export let mode: ViewerMode = "document";
  export let wide = false;
  export let tall = false;
  export let track: boolean | "once" = false;
  export let width: number = undefined;
  export let embed = isEmbedded();

  const dispatch = createEventDispatcher();

  const currentPage: Writable<number> = getContext("currentPage");

  let io: IntersectionObserver;
  let container: HTMLElement;
  let visible: boolean;

  $: id = pageHashUrl(page_number).replace("#", "");
  $: href = getViewerHref({ document, mode, page: page_number, embed });

  function watch(el: HTMLElement, once = false): IntersectionObserver {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // update state
            visible = true;
            dispatch("visible");

            if (once) {
              observer.unobserve(el);
            }
          } else {
            visible = false;
          }

          const { boundingClientRect, rootBounds } = entry;

          if (
            boundingClientRect?.top > rootBounds?.top &&
            boundingClientRect?.top < rootBounds?.height / 2 &&
            currentPage // in case context is missing
          ) {
            $currentPage = page_number;
            replaceState(pageHashUrl($currentPage), {});
          }
        });
      },
      {
        // [0, 0.1, 0.2, ...]
        threshold: Array(11)
          .fill(undefined)
          .map((n, i) => i / 10),
      },
    );

    io.observe(el);

    return io;
  }

  function unwatch(io: IntersectionObserver, el: HTMLElement) {
    io?.unobserve(el);
  }

  onMount(() => {
    if (track) {
      io = watch(container, track === "once");
    }

    return () => {
      unwatch(io, container);
    };
  });
</script>

<div
  {id}
  bind:this={container}
  bind:clientWidth={width}
  class="page"
  class:wide
  class:tall
>
  <div class="title"><slot name="title" /></div>
  <header>
    <h4 class="pageNumber">
      <a {href}>
        {$_("documents.pageAbbrev")}
        {page_number}
      </a>
    </h4>

    {#if $$slots.actions}
      <div class="actions">
        <slot name="actions" />
      </div>
    {/if}
  </header>
  <slot {id} {href} {visible} />
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: center;
    position: relative;
    max-width: 100%;
    scroll-margin-top: 6rem;
  }

  .page.wide {
    width: 100%;
  }

  header {
    display: flex;
    padding: 0.5rem;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }

  .pageNumber {
    flex: 0 0 auto;
    color: var(--gray-4, #5c717c);
    font-weight: var(--font-regular);
  }

  .pageNumber a {
    color: inherit;
    text-decoration: none;
  }

  .pageNumber a:hover {
    text-decoration: underline;
  }

  .title {
    width: 100%;
    padding: 0.5rem;
    overflow: hidden;
    border-bottom: 2px solid var(--gray-2);
  }
  .title:empty {
    display: none;
  }

  .actions {
    flex: 0 0 auto;
  }
</style>
