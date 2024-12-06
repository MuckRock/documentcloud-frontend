<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";

  import type { Document } from "$lib/api/types";
  import PageHighlights from "../PageHighlights.svelte";

  import search from "@/test/fixtures/documents/search-highlight.json";

  // find one document with highlights
  const document = search.results.find(
    (d) => d.id === "3913417",
  ) as unknown as Document;

  export const meta = {
    title: "Components / Documents / Page Highlights",
    component: PageHighlights,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  };
</script>

<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  setContext(
    "highlightState",
    writable({
      allOpen: true,
    }),
  );
</script>

<Story name="closed">
  <PageHighlights {document} />
</Story>

<Story name="open">
  <PageHighlights {document} open />
</Story>
