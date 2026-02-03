<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AnnotationToolbar from "../AnnotationToolbar.svelte";

  const { Story } = defineMeta({
    title: "Toolbars / Annotation",
    component: AnnotationToolbar,
    parameters: {
      layout: "fullscreen",
    },
  });
</script>

<Story name="Default">
  <AnnotationToolbar />
</Story>

<Story name="Desktop">
  <AnnotationToolbar />
</Story>

<Story
  name="Tablet (H)"
  parameters={{
    viewport: { defaultOrientation: "landscape", defaultViewport: "tablet" },
  }}
>
  <AnnotationToolbar />
</Story>

<Story
  name="Tablet (V)"
  parameters={{
    viewport: { defaultOrientation: "tablet", defaultViewport: "tablet" },
  }}
>
  <AnnotationToolbar />
</Story>

<Story
  name="Mobile (L)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile2" },
  }}
>
  <AnnotationToolbar />
</Story>

<Story
  name="Mobile (S)"
  parameters={{
    viewport: { defaultOrientation: "portrait", defaultViewport: "mobile1" },
  }}
>
  <AnnotationToolbar />
</Story>
