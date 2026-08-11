<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PaginationToolbar from "../PaginationToolbar.svelte";
  import ViewerContext from "$lib/components/viewer/ViewerContext.svelte";
  import { document } from "@/test/fixtures/documents";

  const { Story } = defineMeta({
    title: "Toolbars / Pagination",
    component: PaginationToolbar,
    parameters: {
      layout: "fullscreen",
    },
    render: template,
  });
</script>

<!-- This toolbar reads the viewer state, so it needs a provider. `loadPdf` is
     off because the toolbar renders from state alone and never draws a page. -->
{#snippet template()}
  <ViewerContext {document} loadPdf={false}>
    <div class="vh justify-end">
      <PaginationToolbar />
    </div>
  </ViewerContext>
{/snippet}

<Story name="Default" />

<Story name="Desktop" />

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

<style>
  .vh {
    height: 100vh;
  }
  .justify-end {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
</style>
