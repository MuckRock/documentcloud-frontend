<script lang="ts">
  import type { Note } from "$lib/api/types";

  import DOMPurify from "isomorphic-dompurify";

  import { ALLOWED_ATTR, ALLOWED_TAGS } from "@/config/config.js";

  export let note: Note;

  function clean(html: string) {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    });
  }
</script>

{#if note.content}
  <div class="content">
    <p>{@html clean(note.content)}</p>
  </div>
{/if}

<style>
  .content {
    line-height: 1.5;
    font-size: var(--font-md);
  }
</style>
