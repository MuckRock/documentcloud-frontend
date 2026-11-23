<!-- @component
Test helper: renders a GridPage for each of the viewer's pages inside the
DragDropProvider GridPage requires, and hands the ViewerState to `onViewer`.
`pageProps` overrides the slot props for every page.
-->
<script lang="ts">
  import type { ComponentProps } from "svelte";

  import { DragDropProvider } from "@dnd-kit/svelte";

  import GridPage from "../GridPage.svelte";
  import { getViewerState, type ViewerState } from "$lib/state/viewer.svelte";

  type SlotProps = Omit<ComponentProps<typeof GridPage>, "id" | "index">;

  interface Props {
    onViewer?: (viewer: ViewerState) => void;
    pageProps?: Partial<SlotProps>;
  }

  const { onViewer, pageProps = {} }: Props = $props();

  const viewer = getViewerState();
  function report() {
    onViewer?.(viewer);
  }
  report();
</script>

<DragDropProvider>
  {#each viewer.pages as { id }, index (id)}
    <section data-testid="page-{index + 1}">
      <GridPage
        {id}
        {index}
        width={100}
        height={130}
        margin={0}
        rotation={0}
        src="https://assets.documentcloud.org/p{index + 1}-small.gif"
        {...pageProps}
      />
    </section>
  {/each}
</DragDropProvider>
