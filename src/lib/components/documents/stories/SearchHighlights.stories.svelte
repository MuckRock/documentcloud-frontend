<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import SearchHighlight from "../SearchHighlight.svelte";

  import highlight from "$lib/api/fixtures/documents/highlight.json";

  export const meta = {
    title: "Components / Documents / Search Highlight",
    component: highlight,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <SearchHighlight {highlight} />
</Story>
