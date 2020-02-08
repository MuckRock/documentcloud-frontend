<script>
  import ContentItem from "./ContentItem";

  import { viewer } from "@/viewer/viewer";
</script>

<style lang="scss">
  .toc {
    background: white;
    padding: 8px 20px;
  }
</style>

<div class="toc">
  {#if $viewer.sectionsAndNotes != null}
    {#each $viewer.sectionsAndNotes as sectionOrNote}
      <ContentItem {sectionOrNote} />
    {/each}
  {/if}
</div>
