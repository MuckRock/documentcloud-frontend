<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ReadingToolbar from "../ReadingToolbar.svelte";

  const { Story } = defineMeta({
    title: "Toolbars / Reading",
    component: ReadingToolbar,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<Story name="Default">
  <ReadingToolbar />
</Story>

<Story name="Desktop">
  <ReadingToolbar />
</Story>

<Story
  name="Tablet (H)"
  parameters={{
    viewport: { defaultOrientation: "landscape", defaultViewport: "tablet" },
  }}
>
  <ReadingToolbar />
</Story>

<Story
  name="Tablet (V)"
  parameters={{
    viewport: { defaultOrientation: "tablet", defaultViewport: "tablet" },
  }}
>
  <ReadingToolbar />
</Story>

<Story
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
>
  <ReadingToolbar />
</Story>

<Story
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
>
  <ReadingToolbar />
</Story>
