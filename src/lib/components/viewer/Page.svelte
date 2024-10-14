<!-- @component
Page is a generic container for Viewer content.

Assumes it's a child of a ViewerContext
-->

<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import { pageHashUrl } from "$lib/api/documents";
  import {
    getCurrentMode,
    getCurrentPage,
    getDocument,
    isEmbedded,
  } from "$lib/components/viewer/ViewerContext.svelte";
  import { getViewerHref } from "$lib/utils/viewer";
  import PageActions from "./PageActions.svelte";

  export let page_number: number;
  export let wide = false;
  export let tall = false;
  export let track: boolean | "once" = false;
  export let width: number = undefined;

  const dispatch = createEventDispatcher();

  const document = getDocument();
  const currentPage = getCurrentPage();
  const mode = getCurrentMode();
  const embed = isEmbedded();

  let io: IntersectionObserver;
  let container: HTMLElement;
  let visible: boolean;

  $: id = pageHashUrl(page_number).replace("#", "");
  $: href = getViewerHref({ document, mode: $mode, page: page_number, embed });
  $: documentHref = getViewerHref({
    document,
    mode: "document",
    page: page_number,
    embed,
  });

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
            // replaceState(pageHashUrl($currentPage), {});
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

    <PageActions {document} {page_number} pageWidth={width} />
  </header>
  <slot {id} {href} {visible} {documentHref} />
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
</style>
