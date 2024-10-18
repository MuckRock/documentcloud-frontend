<script lang="ts" context="module">
  import type { Meta } from "@storybook/svelte";
  import AnnotationToolbar from "../AnnotationToolbar.svelte";
  import { Template, Story } from "@storybook/addon-svelte-csf";

  import { document } from "@/test/fixtures/documents";

  export const meta: Meta = {
    title: "Components / Viewer / Toolbars / Annotation",
    component: AnnotationToolbar,
    parameters: {
      layout: "fullscreen",
    },
  };

  let args = {
    document,
  };
</script>

<Template let:args>
  <AnnotationToolbar {...args} />
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
