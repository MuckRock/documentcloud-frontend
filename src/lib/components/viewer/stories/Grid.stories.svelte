<script context="module" lang="ts">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import type { Document } from "$lib/api/types";
  import ViewerContext from "../ViewerContext.svelte";
  import Grid from "../Grid.svelte";

  export const meta = {
    title: "Viewer / Grid",
    component: Grid,
    parameters: { layout: "fullscreen" },
  };

  import doc from "@/test/fixtures/documents/examples/lefler-thesis.json";

  const document = doc as Document;

  let args = {
    context: {
      document,
    },
    props: {
      size: "thumbnail",
    },
  };
</script>

<Template let:args>
  <ViewerContext {...args.context}>
    <Grid {...args.props} />
  </ViewerContext>
</Template>

<Story
  name="small"
  args={{ ...args, props: { ...args.props, size: "small" } }}
/>
