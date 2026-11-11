<script lang="ts">
  import { _ } from "svelte-i18n";
  import { createSortable } from "@dnd-kit/svelte/sortable";
  import { Feedback } from "@dnd-kit/dom";
  import { Sync16 } from "svelte-octicons";

  import { getViewerState } from "$lib/state/viewer.svelte";

  import Page from "$lib/components/viewer/Page.svelte";

  interface Props {
    id: number;
    index: number;
    width: number;
    height: number;
    margin: number;
    rotation: number;
    src: string;
  }

  let { id, index, rotation, width, height, margin, src }: Props = $props();

  let missing = $state(false);

  const viewer = getViewerState();

  const document = $derived(viewer.document!);
  const edit = $derived(viewer.mode === "bulk");
  const pending = $derived(document.status === "pending");
  const page_number = $derived(index + 1);
  const title = $derived(`Page ${page_number}, ${document.title}`);

  const sortable = createSortable({
    plugins: [Feedback.configure({ feedback: "clone" })],
    get disabled() {
      // Disallow dropping pages within the selected range
      return { draggable: false, droppable: viewer.selectedPages.has(id) };
    },
    get id() {
      return id;
    },
    get index() {
      return index;
    },
  });

  // The page image has been deleted after a modification and not regenerated yet
  function onError() {
    if (pending) {
      missing = true;
    }
  }
</script>

{#snippet image(selected = false)}
  <div class={["image", { selected, drop: sortable.isDropTarget }]}>
    {#if missing}
      <div class="loading" role="img" aria-label={$_("common.loading")}>
        <Sync16 class="spin" fill="var(--gray-4)" />
      </div>
    {:else}
      <img
        {src}
        class:turn={Math.abs(rotation / 90) % 2 === 1}
        alt={title}
        {title}
        loading="lazy"
        onerror={onError}
      />
    {/if}
  </div>
{/snippet}

<div
  class={["page-container", { edit }]}
  style:--width="{width}px"
  style:--height="{height}px"
  style:--margin="{margin}px"
  style:--rotation="{rotation}deg"
  data-drag-count={viewer.selectedPages.size}
  {@attach sortable.attach}
>
  <Page pageId={id} {page_number}>
    {#snippet children({ documentHref, selected })}
      {#if edit}
        {@render image(selected)}
      {:else}
        <a href={documentHref}>{@render image()}</a>
      {/if}
    {/snippet}
  </Page>
</div>

<style>
  .page-container {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .page-container:global([data-dnd-dragging]):after {
    content: attr(data-drag-count);
    z-index: 1;
    position: absolute;
    top: 0.5rem;
    right: calc(50% - var(--width) / 2);
    width: 1.75rem;
    height: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border-radius: 50%;
    background-color: var(--blue-3);
    border: 1px solid var(--blue-4);
    font-weight: bold;
    letter-spacing: -1px;
  }

  .edit {
    cursor: grab;
  }

  a {
    display: block;
  }

  .image,
  .loading,
  img {
    width: var(--width);
    height: var(--height);
  }

  img.turn {
    width: var(--height);
    height: var(--width);
  }

  .image {
    position: relative;
    box-shadow: var(--shadow-1);
    margin-bottom: var(--margin);
  }

  :global([data-dnd-dragging]) .image {
    opacity: 80%;
  }

  img {
    position: absolute;
    top: 50%;
    left: 50%;
    max-width: none;
    transform: translate(-50%, -50%) rotate(var(--rotation));
  }

  img,
  .loading {
    background-color: var(--white);
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .selected {
    outline: 2px solid var(--blue-3);
  }

  /* Draw the drop target as a vertical divider between pages */
  .drop:after {
    content: "";
    position: absolute;
    top: 0;
    bottom: calc(var(--margin) * -1);
    left: calc(100%);
    width: 1rem;
    border-right: 2px solid var(--blue-3);
  }
</style>
