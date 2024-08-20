<script context="module" lang="ts">
  import type { Document } from "$lib/api/types";

  import { Story } from "@storybook/addon-svelte-csf";
  import SearchHighlights from "../SearchHighlights.svelte";

  import search from "@/test/fixtures/documents/search-highlight.json";

  // find one document with highlights
  const document = search.results.find((d) => d.id === "3913417") as Document;

  export const meta = {
    title: "Components / Documents / Search Highlights",
    component: SearchHighlights,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story name="closed">
  <SearchHighlights {document} />
</Story>

<Story name="open">
  <SearchHighlights {document} open />
</Story>
