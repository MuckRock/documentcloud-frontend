<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PaginationToolbar from "../PaginationToolbar.svelte";

  const { Story } = defineMeta({
    title: "Toolbars / Pagination",
    component: PaginationToolbar,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<Story name="Default" asChild>
  <div class="vh justify-end">
    <PaginationToolbar />
  </div>
</Story>

<Story name="Desktop" asChild>
  <div class="vh justify-end">
    <PaginationToolbar />
  </div>
</Story>

<Story
  asChild
  name="Tablet (H)"
  parameters={{
    viewport: { defaultOrientation: "landscape", defaultViewport: "tablet" },
  }}
>
  <div class="vh justify-end">
    <PaginationToolbar />
  </div>
</Story>

<Story
  asChild
  name="Tablet (V)"
  parameters={{
    viewport: { defaultOrientation: "tablet", defaultViewport: "tablet" },
  }}
>
  <div class="vh justify-end">
    <PaginationToolbar />
  </div>
</Story>

<Story
  asChild
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
>
  <div class="vh justify-end">
    <PaginationToolbar />
  </div>
</Story>

<Story
  asChild
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
>
  <div class="vh justify-end">
    <PaginationToolbar />
  </div>
</Story>

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
