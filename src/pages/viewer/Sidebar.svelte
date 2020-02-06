<script>
  import {
    enterRedactMode,
    enterAnnotateMode,
    enterSectionsMode
  } from "@/viewer/actions";
  import { layout, showAnnotation } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
  import { hoveredNote } from "@/viewer/hoveredNote";
</script>

<style lang="scss">
  .sidebar {
    position: absolute;
    right: 0;
    background: #f0f0f0;
    box-shadow: -4px 0px 4px rgba(0, 0, 0, 0.12);
    overflow: auto;
    z-index: $viewerSidebarZ;

    &.disabled {
      pointer-events: none;
      filter: brightness(90%);
    }

    .toc {
      background: white;
      padding: 8px 20px;

      .note {
        cursor: pointer;

        .title {
          color: #004276;
          font-weight: bold;
          font-size: 13px;
        }

        .page {
          visibility: hidden;
          color: #666;
          font-size: 12px;
          padding-left: 4px;
          font-weight: normal;
        }

        &:hover,
        &.hover {
          .title {
            text-decoration: underline;
          }

          .page {
            visibility: visible;
          }
        }
      }
    }

    .action {
      cursor: pointer;
      background: #ffffff;
      box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
      padding: 8px 20px;

      &:hover {
        background: rgba(black, 0.02);
      }

      h3 {
        font-weight: bold;
        font-size: 14px;
        color: $viewerDarkGray;
        margin: 8px 0;
      }

      p {
        font-size: 14px;
        line-height: 18px;
        color: $viewerGray;
        margin: 8px 0;
      }
    }
  }
</style>

<div
  class="sidebar"
  class:disabled={$layout.disableControls}
  style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px; left:
  calc(100% - {$layout.sidebarWidth}px)">

  <div class="toc">
    {#each $viewer.orderedNotes as note}
      <div
        class="note"
        class:hover={note == $layout.hoveredNote}
        use:hoveredNote={note}
        on:click={() => showAnnotation(note)}>
        <span class="title">{note.title}</span>
        <span class="page">p. {note.page + 1}</span>
      </div>
    {/each}
  </div>

  <div class="action" on:click={enterRedactMode}>
    <h3>Redact</h3>
    <p>
      Create redactions on the document to hide text. The document will
      reprocess afterwards.
    </p>
  </div>
  <div class="action" on:click={enterAnnotateMode}>
    <h3>Annotate</h3>
    <p>Make annotations to keep notes on the document.</p>
  </div>
  <div class="action" on:click={enterSectionsMode}>
    <h3>Edit sections</h3>
    <p>Add sections to organize your document with a table of contents.</p>
  </div>
</div>
