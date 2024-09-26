<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import Grid from "../Grid.svelte";

  export const meta = {
    title: "Components / Viewer / Grid",
    component: Grid,
    parameters: { layout: "fullscreen" },
  };

  import doc from "@/test/fixtures/documents/examples/lefler-thesis.json";

  const document = doc as Document;
</script>

<Story name="thumbnail">
  <Grid {document} />
</Story>

<Story name="small">
  <Grid {document} size="small" />
</Story>
