<!--
  @component
  A single note, either overlaid on a document or on its own.
  It has two states, focused and normal.
-->
<script lang="ts">
  import type { Note } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Pencil16, Trash16 } from "svelte-octicons";
  import Action from "../common/Action.svelte";
  import SignedIn from "../common/SignedIn.svelte";

  import { noteHashUrl, width, height } from "$lib/api/notes";
  import { pageHashUrl } from "$lib/api/documents";

  export let note: Note;
  export let focused = false;

  $: id = noteHashUrl(note).replace("#", "");
  $: href = noteHashUrl(note);
  $: page_number = note.page_number + 1; // note pages are 0-indexed
</script>

{#if focused}
  <div {id} class="note focused {note.access}">
    <header>
      <h3>{note.title}</h3>
      <div class="actions">
        <SignedIn>
          <Action icon={Pencil16}>Edit</Action>
          <Action --color="var(--red)" --fill="var(--red)" icon={Trash16}
            >Delete</Action
          >
        </SignedIn>
      </div>
    </header>
    <div class="excerpt">
      <h4 {id}>
        <a href={pageHashUrl(page_number)}>
          {$_("documents.pageAbbrev")}
          {page_number}
        </a>
      </h4>

      <div class="highlight"></div>
    </div>
    <div class="content">
      {note.content}
    </div>
    <footer></footer>
  </div>
{:else}
  <a
    {id}
    {href}
    class="note {note.access}"
    title={note.title}
    style:top="{note.y1 * 100}%"
    style:left="{note.x1 * 100}%"
    style:width="{width(note) * 100}%"
    style:height="{height(note) * 100}%"
  >
    {note.title}
  </a>
{/if}

<style>
  /* overlay mode */
  a.note {
    border-radius: 0.25rem;
    color: transparent;
    position: absolute;
    opacity: 0.5;
    pointer-events: all;
    mix-blend-mode: multiply;
  }

  a.note.public {
    background-color: var(--note-public);
  }

  a.note.private {
    background-color: var(--note-private);
    border-color: var(--note-private);
  }

  a.note.organization {
    background-color: var(--note-org);
    border-color: var(--note-org);
  }

  /* focused mode */
  .focused {
    display: flex;
    width: 38.0625rem;
    padding: var(--font-xs, 0.75rem) var(--font-md, 1rem);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--font-xs, 0.75rem);
  }

  .focused header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    align-self: stretch;
  }

  .actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--font-md, 1rem);
  }

  .excerpt {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    align-self: stretch;
  }

  .highlight {
    height: 4.25rem;
    align-self: stretch;
    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
    background: var(--gray-1, #f5f6f7);
  }

  h4,
  h4 a {
    color: var(--gray-4, #5c717c);
    text-decoration: none;
    font-weight: var(--font-regular);
  }

  h4 a:hover {
    text-decoration: underline;
  }
</style>
