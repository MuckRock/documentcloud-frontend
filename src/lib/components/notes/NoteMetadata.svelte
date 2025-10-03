<script lang="ts">
  import type { Note, User } from "$lib/api/types";
  import { _ } from "svelte-i18n";
  import { getUserName } from "$lib/api/accounts";

  export let note: Note;

  $: user = typeof note.user === "object" ? (note.user as User) : null;
</script>

<div class="note-metadata">
  {#if user}
    <p class="created-by">
      {$_("annotation.by", { values: { name: getUserName(user) } })}
    </p>
  {/if}
  <p class="last-modified">
    {#if note.updated_at && note.updated_at !== note.created_at}
      {$_("annotation.edited", {
        values: { date: new Date(note.updated_at).toLocaleDateString() },
      })}
    {:else}
      {$_("annotation.created", {
        values: { date: new Date(note.created_at).toLocaleDateString() },
      })}
    {/if}
  </p>
</div>

<style>
  .note-metadata {
    display: flex;
    align-items: baseline;
    gap: 1rem;

    font-size: var(--font-xs);
    color: var(--gray-5);
  }
</style>
