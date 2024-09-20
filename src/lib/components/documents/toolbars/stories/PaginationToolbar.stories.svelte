<script lang="ts" context="module">
  import type { Meta } from "@storybook/svelte";
  import PaginationToolbar from "../PaginationToolbar.svelte";
  import { Template, Story } from "@storybook/addon-svelte-csf";

  import { document } from "@/test/fixtures/documents";

  export const meta: Meta = {
    title: "Components / Documents / Toolbars / Pagination",
    component: PaginationToolbar,
    parameters: {
      layout: "fullscreen",
    },
  };

  let args = {
    document,
  };
</script>

<Template let:args>
  <div class="vh justify-end">
    <PaginationToolbar {...args} />
  </div>
</Template>

<Story name="Default" {args} />

<Story name="Desktop" {args} />

<Story
  {args}
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
  {args}
/>

<Story
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
  {args}
/>

<Story
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
  {args}
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
