<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PaginationToolbar from "../PaginationToolbar.svelte";

  const { Story } = defineMeta({
    title: "Toolbars / Pagination",
    component: PaginationToolbar,
    parameters: {
      layout: "fullscreen",
    },
    render: template,
  });
</script>

{#snippet template()}
  <div class="vh justify-end">
    <PaginationToolbar />
  </div>
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
