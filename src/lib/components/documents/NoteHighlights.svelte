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
  import { run } from "svelte/legacy";

  import type { Writable } from "svelte/store";
  import type { Document } from "$lib/api/types";

  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  import Highlight from "./Highlight.svelte";
  import HighlightGroup from "./HighlightGroup.svelte";

  import { noteUrl } from "$lib/api/notes";

  interface Props {
    document: Document;
    open?: boolean;
  }

  let { document, open = $bindable(true) }: Props = $props();

  const { subscribe } =
    getContext<Writable<{ allOpen: boolean }>>("highlightState") ?? {};
  run(() => {
    subscribe?.((state) => {
      open = state.allOpen;
    });
  });

  let highlights = $derived(Object.entries(document.note_highlights ?? {}));
  let notes = $derived(new Map(document.notes?.map((n) => [n.id, n])));

  function noteHref(id: string): string {
    const note = notes.get(id);
    if (!note) return "";
    return noteUrl(document, note).href;
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
  {#snippet summary()}
    {$_("documents.matchingNotes", { values: { n: highlights.length } })}
  {/snippet}
  {#snippet children({ highlight })}
    <Highlight
      title={(highlight.title ?? []).join("\n").trim()}
      segments={highlight.description}
    />
  {/snippet}
</HighlightGroup>
