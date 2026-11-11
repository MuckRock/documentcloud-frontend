<!-- @component
Page is a generic container for Viewer content.

Must be a child of a ViewerContext
-->

<script lang="ts">
  import type { Maybe } from "$lib/api/types";
  import type { EditButton } from "$lib/state/edit.svelte";

  import { page } from "$app/state";

  import { type Snippet, onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import PageActions from "./PageActions.svelte";
  import Checkbox from "$lib/components/inputs/Checkbox.svelte";
  import EditActionsToolbar from "$lib/components/toolbars/EditActionsToolbar.svelte";

  import { pageHashUrl } from "$lib/api/documents";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { getQuery } from "$lib/utils/search";
  import { getViewerHref } from "$lib/utils/viewer";

  interface Props {
    page_number: number;
    pageId?: number;
    track?: boolean | "once";
    width?: number | undefined;
    title?: Snippet;
    children?: Snippet<[any]>;
    visible?: boolean;
  }

  let {
    page_number,
    pageId,
    track = false,
    width = $bindable(undefined),
    title,
    children,
    visible = $bindable(false),
  }: Props = $props();

  const viewer = getViewerState();

  let io: IntersectionObserver;
  let container: Maybe<HTMLElement> = $state();

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
      query: getQuery(page.url, "q"),
    }),
  );
  let showPageActions = $derived(
    !viewer.embed && !["edit", "bulk"].includes(viewer.mode),
  );
  let selected = $derived(
    viewer.mode === "bulk" && viewer.selectedPages.has(pageId!),
  );
  let selectMultiple = $state(false);

  function watch(el: HTMLElement, once = false): IntersectionObserver {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // update state
            visible = true;

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

  function onEdit(action: EditButton) {
    switch (action) {
      case "up":
      case "down":
        const index = viewer.pages.findIndex(({ id }) => id === pageId);
        const offset = action === "up" ? -2 : 1;
        const position = viewer.pages[index + offset]?.id!;
        viewer.history.edit({ action: "move", pages: [pageId!], position });
        break;
      case "cw":
      case "ccw":
      case "delete":
        viewer.history.edit({ action, pages: [pageId!] });
        break;
      case "duplicate":
        viewer.history.edit({ action, pages: [pageId!], position: pageId! });
    }
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

<div {id} bind:this={container} bind:clientWidth={width} class="page">
  <div class="title">{@render title?.()}</div>
  <header class="pin-x">
    <h4 class="pageNumber">
      <a href={documentHref}>
        {$_("documents.pageAbbrev")}
        {page_number}
      </a>
    </h4>

    {#if !viewer.embed}
      {#if showPageActions}
        <PageActions
          {document}
          notes={viewer.notes}
          {page_number}
          pageWidth={width}
        />
      {:else if viewer.mode === "bulk"}
        <div class="check">
          <Checkbox
            sronly
            label={$_("inputs.selectPage", { values: { page: page_number } })}
            onclick={(e) => (selectMultiple = e.shiftKey)}
            bind:value={
              () => selected, () => viewer.selectPage(pageId!, selectMultiple)
            }
          />
        </div>
      {:else if viewer.mode === "edit"}
        <div class="edit-actions">
          <EditActionsToolbar
            mode="edit"
            first={page_number === 1}
            last={page_number === viewer.pages.length}
            {onEdit}
          />
        </div>
      {/if}
    {/if}
  </header>
  {@render children?.({ id, href, visible, documentHref, selected })}
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

  header {
    display: flex;
    padding: 0.5rem;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
    z-index: 1;
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

  .check {
    margin: 5px 0;
  }

  .edit-actions {
    background-color: var(--white);
    border-radius: 0.75rem;
    box-shadow: var(--shadow-1);
    padding: 0.25rem;
    display: flex;
  }
</style>
