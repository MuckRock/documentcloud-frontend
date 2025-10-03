<script lang="ts">
  import type { Document, Note } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { getViewerHref } from "$lib/utils/viewer";
  import { isPageLevel } from "$lib/api/notes";

  export let doc: Document;
  export let note: Note;
  export let embed: boolean = false;

  $: page_level = isPageLevel(note);
  $: note_url = getViewerHref({ document: doc, note });
</script>

<h3>
  {#if page_level}
    {note.title}
  {:else}
    <a href={note_url} target={embed ? "_blank" : null}>
      {note.title}
    </a>
  {/if}
</h3>

<style>
  h3 {
    flex: 0 1 auto;
    text-align: left;
    font-weight: var(--font-semibold);
  }
</style>
