<script lang="ts">
  import type { Note } from "$lib/api/types";

  import { clean } from "$lib/utils/markup";

  export let note: Note;
</script>

{#if note.content}
  <div class="content">
    {@html clean(note.content)}
  </div>
{/if}

<style>
  .content {
    line-height: 1.5;
    font-size: var(--font-md);
  }
</style>
