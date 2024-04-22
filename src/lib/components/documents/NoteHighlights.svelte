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
  import type { Document } from "$lib/api/types";

  import DOMPurify from "isomorphic-dompurify";
  import { _ } from "svelte-i18n";
  import { noteUrl } from "$lib/api/notes";

  export let document: Document;
  export let open = false;

  $: note_highlights = document.note_highlights;
  $: count = Object.keys(note_highlights).length;
  $: notes = new Map(document.notes.map((n) => [n.id, n]));

  function sanitize(s: string): string {
    return DOMPurify.sanitize(s, { ALLOWED_TAGS: ["em"] });
  }
</script>

{#if count > 0}
  <details bind:open>
    <summary>{$_("document.matchingNotes", { values: { n: count } })}</summary>

    {#each Object.entries(note_highlights) as [note_id, highlight]}
      {@const note = notes.get(note_id)}
      <blockquote>
        {#if highlight.title}
          <h4>{@html sanitize(highlight.title.join("\n").trim())}</h4>
        {/if}

        {#if highlight.description}
          {#each highlight.description as segment}
            <p class="segment">{@html sanitize(segment)}</p>
          {/each}
        {/if}
        <cite>
          <a href={noteUrl(document, note).toString()}
            >{$_("document.noteLink")}</a
          >
        </cite>
      </blockquote>
    {/each}
  </details>
{/if}

<style>
  h4 :global(em),
  .segment :global(em) {
    background-color: var(--yellow);
    font-style: normal;
  }
</style>
