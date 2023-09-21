<script>
  import ContentItem from "./ContentItem.svelte";

  import { viewer } from "@/viewer/viewer.js";
</script>

<style>
  .toc {
    padding: 8px 0;
  }
</style>

<div class="toc">
  {#if $viewer.sectionsAndNotes != null}
    {#each $viewer.sectionsAndNotes as sectionOrNote}
      <ContentItem {sectionOrNote} />
    {/each}
  {/if}
</div>
