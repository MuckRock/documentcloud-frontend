<!--
  @component
  Highlights from annotations matching a search query, like this:

  ```json
  "197010": {
    "title": [
      "<em>Boston</em> police officer dies after medical emergency"
    ],
    "description": [
      "<em>Boston</em> police officer dies after medical emergency. [<a href=\"http://www.bostonglobe.com/metro/2014"
    ]
  }
  ```

  Note that highlights may contain broken bits of HTML. Sanitize accordingly.
-->

<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { _ } from "svelte-i18n";

  import type { Document } from "$lib/api/types";
  import { noteUrl } from "$lib/api/notes";
  import Highlight from "../common/Highlight.svelte";
  import HighlightGroup from "../common/HighlightGroup.svelte";

  export let document: Document;
  export let open = true;

  const { subscribe } =
    getContext<Writable<{ allOpen: boolean }>>("highlightState") ?? {};
  $: subscribe?.((state) => {
    open = state.allOpen;
  });

  $: highlights = Object.entries(document.note_highlights ?? {});
  $: notes = new Map(document.notes?.map((n) => [n.id, n]));

  function noteHref(id: string): string {
    const note = notes.get(id);
    if (!note) return "";
    return noteUrl(document, note).toString();
  }
</script>

<HighlightGroup
  {highlights}
  getHref={noteHref}
  bind:open
  showAll={Boolean(subscribe)}
  on:collapseAll
  on:expandAll
>
  <svelte:fragment slot="summary">
    {$_("documents.matchingNotes", { values: { n: highlights.length } })}
  </svelte:fragment>
  <svelte:fragment let:highlight>
    <Highlight
      title={(highlight.title ?? []).join("\n").trim()}
      segments={highlight.description}
    />
  </svelte:fragment>
</HighlightGroup>
