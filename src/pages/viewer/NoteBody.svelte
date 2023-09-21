<script>
  import { layout } from "@/viewer/layout.js";
  import { viewer } from "@/viewer/viewer.js";
  import Annotation from "./Annotation.svelte";

  let width = 0;
</script>

<style lang="scss">
  .doc {
    left: 0;
    background: $viewerBodyBg;
    position: absolute;
    overflow: auto;
    padding: 2em 0;

    .notes {
      max-width: 720px;
      width: 90%;
      margin: 0 auto;
    }
  }
</style>

<div
  style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px; right:
  {$layout.sidebarWidth}px;"
  class="doc"
>
  <div class="notes" bind:clientWidth={width}>
    {#if $viewer.pageAspects != null}
      {#each $viewer.orderedNotes as note}
        <Annotation
          page={{
            aspect: $viewer.pageAspects[note.page],
            pageNumber: note.page,
            document: $viewer.document,
          }}
          pageNote={true}
          {width}
          mode={$layout.annotateMode}
          aspect={$viewer.pageAspects[note.page]}
          showImageOnPageNote={!note.isPageNote}
          annotation={note}
        />
      {/each}
    {/if}
  </div>
</div>
