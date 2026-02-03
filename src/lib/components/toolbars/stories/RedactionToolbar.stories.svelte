<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import RedactionToolbar from "../RedactionToolbar.svelte";

  const { Story } = defineMeta({
    title: "Toolbars / Redaction",
    component: RedactionToolbar,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<Story name="Default">
  <RedactionToolbar />
</Story>

<Story name="Desktop">
  <RedactionToolbar />
</Story>

<Story
  name="Tablet (H)"
  parameters={{
    viewport: { defaultOrientation: "landscape", defaultViewport: "tablet" },
  }}
>
  <RedactionToolbar />
</Story>

<Story
  name="Tablet (V)"
  parameters={{
    viewport: { defaultOrientation: "tablet", defaultViewport: "tablet" },
  }}
>
  <RedactionToolbar />
</Story>

<Story
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
>
  <RedactionToolbar />
</Story>

<Story
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
>
  <RedactionToolbar />
</Story>
