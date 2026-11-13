<!--
  @component
  Show a grid of thumbnail images for a single document.
  Each image should link to its respective page.

  Must be a child of a ViewerContext.

  Pages are only rendered in the browser to limit server-side page size.
-->
<script lang="ts">
  import type { Sizes } from "$lib/api/types";
  import type { ComponentProps } from "svelte";

  import { browser } from "$app/environment";
  import { _ } from "svelte-i18n";
  import { VMasonry } from "virtua/svelte";
  import { DragDropProvider } from "@dnd-kit/svelte";
  import { isSortable } from "@dnd-kit/svelte/sortable";

  import GridPage from "$lib/components/viewer/GridPage.svelte";

  import { IMAGE_WIDTHS_MAP } from "@/config/config.js";
  import { pageImageUrl } from "$lib/api/documents";
  import { getViewerState } from "$lib/state/viewer.svelte";
  import { zoomToSize } from "$lib/utils/viewer";

  interface Props {
    size?: Sizes;
  }

  type DragDropProps = ComponentProps<typeof DragDropProvider>;

  let { size = "thumbnail" }: Props = $props();

  const viewer = getViewerState();

  const SCALE = {
    thumbnail: 1,
    small: 1,
    normal: 3,
    large: 3,
  };

  const GAP = 24;
  const PADDING = 32;

  let document = $derived(viewer.document!);
  $effect(() => {
    size = zoomToSize(viewer.zoom);
  });

  let containerWidth = $state(0);

  let pages = $derived(viewer.pages);
  let selectedPages = $derived(viewer.selectedPages);
  let scale = $derived(SCALE[size] ?? 1);
  let width = $derived((IMAGE_WIDTHS_MAP.get(size) ?? 180) / scale);
  let maxHeight = $derived(
    width / Math.min(...pages.map(({ aspectRatio }) => aspectRatio)),
  );
  let lanes = $derived(
    Math.max(
      1,
      Math.floor((containerWidth - 2 * PADDING + GAP) / (width + GAP)),
    ),
  );
  let keepMounted = $derived(
    pages.flatMap((p, i) => (selectedPages.has(p.id) ? [i] : [])),
  );

  const onDragStart: DragDropProps["onDragStart"] = ({ operation }) => {
    const id = operation.source?.id as number;
    if (!selectedPages.has(id)) {
      selectedPages.clear();
      selectedPages.add(id);
    }
  };

  const onDragEnd: DragDropProps["onDragEnd"] = ({ canceled, operation }) => {
    if (canceled) return;
    const { source, target } = operation;

    if (isSortable(source) && isSortable(target)) {
      const fromIndex = source.index;
      const toIndex = target.index;

      if (fromIndex !== toIndex) {
        viewer.history.edit({
          action: "move",
          pages: [...selectedPages],
          position: target.id as number,
        });
      }
    }
  };
</script>

<DragDropProvider {onDragStart} {onDragEnd}>
  <div class="pages" bind:clientWidth={containerWidth}>
    {#if browser}
      <VMasonry
        getKey={({ id }) => id}
        {keepMounted}
        {lanes}
        data={pages}
        gap={GAP}
        style="padding: {PADDING}px"
      >
        {#snippet children(
          { id, oneIndexedPageNumber, aspectRatio, rotation },
          index,
        )}
          {@const height = width / aspectRatio}
          {@const margin = lanes > 1 ? maxHeight - height : 0}
          {@const src = pageImageUrl(
            document,
            oneIndexedPageNumber,
            size,
            viewer.imageVersion,
          ).href}
          <GridPage {id} {index} {width} {height} {margin} {rotation} {src} />
        {/snippet}
      </VMasonry>
    {/if}
  </div>
</DragDropProvider>

<style>
  .pages {
    height: 100%;
  }
</style>
