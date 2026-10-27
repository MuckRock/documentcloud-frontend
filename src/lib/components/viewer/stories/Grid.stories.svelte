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
