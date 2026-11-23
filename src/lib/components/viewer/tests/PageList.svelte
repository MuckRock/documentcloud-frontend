<!-- @component
Test helper: renders a Page for each of the viewer's pages, keyed by ID the
way PDF and Grid do, and hands the ViewerState to `onViewer`.
-->
<script lang="ts">
  import Page from "../Page.svelte";
  import { getViewerState, type ViewerState } from "$lib/state/viewer.svelte";

  const { onViewer }: { onViewer?: (viewer: ViewerState) => void } = $props();

  const viewer = getViewerState();
  function report() {
    onViewer?.(viewer);
  }
  report();
</script>

{#each viewer.pages as { id }, n (id)}
  <section data-testid="page-{n + 1}">
    <Page pageId={id} page_number={n + 1} />
  </section>
{/each}
