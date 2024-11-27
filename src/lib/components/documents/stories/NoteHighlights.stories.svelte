<script context="module" lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import { Story } from "@storybook/addon-svelte-csf";

  import type { Document } from "$lib/api/types";
  import NoteHighlights from "../NoteHighlights.svelte";

  import search from "@/test/fixtures/documents/search-highlight.json";

  const document = search.results.find(
    (d) => d.id === "1501881",
  ) as unknown as Document;

  export const meta = {
    title: "Components / Documents / Note Highlights",
    component: NoteHighlights,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  };

  setContext(
    "highlightState",
    writable({
      allOpen: true,
    }),
  );
</script>

<Story name="closed">
  <NoteHighlights {document} />
</Story>

<Story name="open">
  <NoteHighlights {document} open />
</Story>
