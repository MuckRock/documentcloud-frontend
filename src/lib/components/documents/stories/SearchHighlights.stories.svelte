<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import SearchHighlight from "../SearchHighlight.svelte";

  import search from "$lib/api/fixtures/documents/search-highlight.json";

  // find one document with highlights
  const document = search.results.find((d) => d.id === "3913417") as Document;
  const highlight = document.highlights;

  export const meta = {
    title: "Components / Documents / Search Highlight",
    component: highlight,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="default">
  <SearchHighlight {document} {highlight} />
</Story>
