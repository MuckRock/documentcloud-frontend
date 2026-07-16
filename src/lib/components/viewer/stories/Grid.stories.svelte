<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { Document } from "$lib/api/types";
  import ViewerContext from "../ViewerContext.svelte";
  import Grid from "../Grid.svelte";

  import doc from "@/test/fixtures/documents/examples/lefler-thesis.json";

  const document = doc as Document;

  const { Story } = defineMeta({
    title: "Viewer / Grid",
    component: Grid,
    parameters: { layout: "fullscreen" },
    render: template,
  });

  let args = {
    context: {
      document,
    },
    props: {
      size: "thumbnail",
    },
  };
</script>

{#snippet template(args)}
  <ViewerContext {...args.context}>
    <Grid {...args.props} />
  </ViewerContext>
{/snippet}

<Story
  name="small"
  args={{ ...args, props: { ...args.props, size: "small" } }}
/>
