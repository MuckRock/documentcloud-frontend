<script lang="ts">
  import type { Note } from "$lib/api/types";

  import { clean } from "$lib/utils/markup";

  interface Props {
    note: Note;
  }

  let { note }: Props = $props();
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
