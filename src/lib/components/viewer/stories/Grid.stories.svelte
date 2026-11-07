<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { Document } from "$lib/api/types";
  import ViewerContext from "../ViewerContext.svelte";
  import Grid from "../Grid.svelte";

  import doc from "@/test/fixtures/documents/examples/lefler-thesis.json";

  const { notes = [], ...document } = doc as Document;

  const { Story } = defineMeta({
    title: "Viewer / Grid",
    component: Grid,
    parameters: { layout: "fullscreen" },
    render: template,
  });

  let args = {
    context: {
      document,
      notes,
      mode: "grid",
    },
    width: "100%",
  };
</script>

{#snippet template(args)}
  <ViewerContext {...args.context}>
    <div style:height="100vh" style:width={args.width}>
      <Grid />
    </div>
  </ViewerContext>
{/snippet}

<!-- Page 2 is given a legal-size spec so rows hold pages of unequal height;
     its image is stretched to fit. -->
<Story
  name="mixed page heights"
  args={{
    ...args,
    context: {
      ...args.context,
      document: {
        ...document,
        page_spec: "612.0x792.0:0,2-89,128;612.0x1008.0:1;792.0x612.0:90-127",
      },
    },
  }}
/>

<Story
  name="thumbnail"
  args={{ ...args, context: { ...args.context, zoom: "thumbnail" } }}
/>

<Story
  name="small"
  args={{ ...args, context: { ...args.context, zoom: "small" } }}
/>

<Story
  name="normal"
  args={{ ...args, context: { ...args.context, zoom: "normal" } }}
/>

<Story
  name="large"
  args={{ ...args, context: { ...args.context, zoom: "large" } }}
/>

<Story
  name="xlarge"
  args={{ ...args, context: { ...args.context, zoom: "xlarge" } }}
/>

<Story
  name="bulk edit"
  args={{
    ...args,
    context: { ...args.context, mode: "bulk" },
  }}
/>
