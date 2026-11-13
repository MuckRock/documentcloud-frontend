<script module lang="ts">
  import type { ViewerMode } from "$lib/api/types";
  import type { ViewerState } from "$lib/state/viewer.svelte";

  import { defineMeta } from "@storybook/addon-svelte-csf";
  import EditToolbar from "../EditToolbar.svelte";
  import ViewerContext from "$lib/components/viewer/ViewerContext.svelte";
  import ViewerProbe from "@/test/helpers/ViewerProbe.svelte";
  import { document } from "@/test/fixtures/documents";

  const { Story } = defineMeta({
    title: "Toolbars / Edit",
    component: EditToolbar,
    parameters: { layout: "fullscreen" },
    render: template,
  });

  interface Args {
    mode?: ViewerMode;
    seed?: (viewer: ViewerState) => void;
  }

  // Undo is only enabled once there is an edit to undo.
  const rotateFirstPage = ({ history, pages }: ViewerState) =>
    history.edit({ action: "cw", pages: [pages[0]!.id] });
</script>

<!-- This toolbar reads the viewer state, so it needs a provider. `loadPdf` is
     off because the toolbar renders from state alone and never draws a page. -->
{#snippet template({ mode = "edit", seed }: Args)}
  <ViewerContext {document} notes={[]} {mode} loadPdf={false}>
    <ViewerProbe onViewer={seed}>
      <EditToolbar />
    </ViewerProbe>
  </ViewerContext>
{/snippet}

<Story name="Default" />

<Story name="With edits" args={{ seed: rotateFirstPage }} />

<Story name="Bulk" args={{ mode: "bulk" }} />

<Story
  name="Tablet (H)"
  parameters={{
    viewport: { defaultOrientation: "landscape", defaultViewport: "tablet" },
  }}
/>

<Story
  name="Tablet (V)"
  parameters={{
    viewport: { defaultOrientation: "tablet", defaultViewport: "tablet" },
  }}
/>

<Story
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
/>

<Story
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
/>
