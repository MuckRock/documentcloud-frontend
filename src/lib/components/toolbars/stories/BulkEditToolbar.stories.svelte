<script module lang="ts">
  import type { ViewerState } from "$lib/state/viewer.svelte";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import BulkEditToolbar from "../BulkEditToolbar.svelte";
  import ViewerContext from "$lib/components/viewer/ViewerContext.svelte";
  import ViewerProbe from "@/test/helpers/ViewerProbe.svelte";
  import { document } from "@/test/fixtures/documents";

  const { Story } = defineMeta({
    title: "Toolbars / Bulk Edit",
    component: BulkEditToolbar,
    parameters: { layout: "fullscreen" },
    render: template,
  });

  const selectFirst =
    (count: number) =>
    ({ pages, selectedPages }: ViewerState) =>
      pages.slice(0, count).forEach(({ id }) => selectedPages.add(id));
</script>

<!-- This toolbar reads the viewer state, so it needs a provider. `loadPdf` is
     off because the toolbar renders from state alone and never draws a page. -->
{#snippet template(args: { seed?: (viewer: ViewerState) => void })}
  <ViewerContext {document} notes={[]} mode="bulk" loadPdf={false}>
    <ViewerProbe onViewer={args.seed}>
      <BulkEditToolbar />
    </ViewerProbe>
  </ViewerContext>
{/snippet}

<Story name="Nothing selected" />

<Story name="Some selected" args={{ seed: selectFirst(3) }} />

<Story name="All selected" args={{ seed: selectFirst(document.page_count) }} />
