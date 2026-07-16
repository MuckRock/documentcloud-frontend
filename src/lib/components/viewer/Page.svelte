<!-- @component
Page is a generic container for Viewer content.

Must be a child of a ViewerContext
-->

<script lang="ts">
  import type { Maybe } from "$lib/api/types";

  import { page } from "$app/stores";

  import { type Snippet, onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import PageActions from "./PageActions.svelte";

  import { pageHashUrl } from "$lib/api/documents";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { getQuery } from "$lib/utils/search";
  import { getViewerHref } from "$lib/utils/viewer";

  interface Props {
    page_number: number;
    wide?: boolean;
    tall?: boolean;
    track?: boolean | "once";
    width?: number | undefined;
    title?: Snippet;
    children?: Snippet<[any]>;
    onvisible?: () => void;
  }

  let {
    page_number,
    wide = false,
    tall = false,
    track = false,
    width = $bindable(undefined),
    title,
    children,
    onvisible,
  }: Props = $props();

  const viewer = getViewerState();

  let io: IntersectionObserver;
  let container: Maybe<HTMLElement> = $state();
  let visible = $state(false);

  let document = $derived(viewer.document!);
  let id = $derived(pageHashUrl(page_number).replace("#", ""));
  let href = $derived(
    getViewerHref({
      document,
      mode: viewer.mode,
      page: page_number,
      embed: viewer.embed,
    }),
  );
  let documentHref = $derived(
    getViewerHref({
      document,
      mode: "document",
      page: page_number,
      embed: viewer.embed,
      query: getQuery($page.url, "q"),
    }),
  );

  function watch(el: HTMLElement, once = false): IntersectionObserver {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // update state
            visible = true;
            onvisible?.();

            if (once) {
              observer.unobserve(el);
            }
          } else {
            visible = false;
          }

          const { boundingClientRect, rootBounds } = entry;
          if (
            rootBounds &&
            boundingClientRect.top > rootBounds.top &&
            boundingClientRect.top < rootBounds.height / 2 &&
            viewer // in case context is missing
          ) {
            viewer.page = page_number;
            // replaceState(pageHashUrl(viewer.page), {});
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

  function unwatch(io: IntersectionObserver, el: Maybe<HTMLElement>) {
    if (el) io?.unobserve(el);
  }

  onMount(() => {
    if (track && container) {
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
  <div class="title">{@render title?.()}</div>
  <header>
    <h4 class="pageNumber">
      <a href={documentHref}>
        {$_("documents.pageAbbrev")}
        {page_number}
      </a>
    </h4>

    {#if !viewer.embed}
      <PageActions {document} {page_number} pageWidth={width} />
    {/if}
  </header>
  {@render children?.({ id, href, visible, documentHref })}
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
