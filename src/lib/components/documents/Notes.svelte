<script lang="ts">
  import type { Note as NoteType } from "$lib/api/types";
  import Note from "./Note.svelte";

  export let notes: NoteType[];
</script>

<div class="pages">
  {#each notes as note}
    <Note {note} focused />
  {/each}
</div>

<style>
  .pages {
    display: flex;
    flex-flow: column;
    align-items: center;
    gap: 3rem;
  }
</style>
