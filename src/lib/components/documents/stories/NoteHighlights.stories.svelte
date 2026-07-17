<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import type { Document } from "$lib/api/types";
  import NoteHighlights from "../NoteHighlights.svelte";

  import search from "@/test/fixtures/documents/search-highlight.json";

  const document = search.results.find(
    (d) => d.id === "1501881",
  ) as unknown as Document;

  const { Story } = defineMeta({
    title: "Documents / Note Highlights",
    component: NoteHighlights,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  });
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

<Story name="closed" asChild>
  <NoteHighlights {document} />
</Story>

<Story name="open" asChild>
  <NoteHighlights {document} open />
</Story>
