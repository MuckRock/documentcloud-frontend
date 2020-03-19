<script>
  import TableOfContents from "./TableOfContents";
  import SpecialMessage from "@/common/SpecialMessage";

  import {
    enterRedactMode,
    enterAnnotateMode,
    enterSectionsMode
  } from "@/viewer/actions";
  import { layout, showEmbedFlow } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
</script>

<style lang="scss">
  .sidebar {
    position: absolute;
    right: 0;
    background: #f0f0f0;
    box-shadow: -4px 0px 4px rgba(0, 0, 0, 0.12);
    overflow: auto;
    z-index: $viewerSidebarZ;
    max-width: 100%;
    -webkit-overflow-scrolling: touch;

    &.white {
      background: white;
    }

    &.disabled {
      pointer-events: none;
      filter: brightness(90%);
    }

    .actions {
      font-size: 12px;
      text-transform: uppercase;
      font-weight: bold;
      padding: 6px 20px;
      background: #dadada;
      background: linear-gradient(#ececec, #dadada);
      border-top: solid 1px #ccc;
      border-bottom: solid 1px #ccc;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.12);
      text-shadow: 0 1px 0 #ffffff5c;
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

    .title {
      padding: 16px 20px 16px 20px;
      background: white;

      h2 {
        font-size: 16px;
      }
    }

    hr {
      border: none;
      border-top: 1px solid #ccc;
    }

    $small: 12px;

    a {
      font-size: $small;
      color: $viewerLink;
    }

    small {
      font-size: $small;

      p {
        margin: 10px 0;
      }
    }
  }
</style>

{#if $layout.showSidebar}
  <div
    class="sidebar"
    class:white={$viewer.me == null}
    class:disabled={$layout.disableControls}
    style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px;
    width: {$layout.sidebarWidth}px">

    {#if $viewer.loaded}
      <div class="title">
        {#if $viewer.document.description != null}
          <details open>
            <summary>
              <h2>{$viewer.document.title}</h2>
            </summary>
            <p>{$viewer.document.description}</p>
          </details>
        {:else}
          <h2>{$viewer.document.title}</h2>
        {/if}

        <TableOfContents />

        <hr />
        <a target="_blank" href={$viewer.document.pdf}>
          Original Document (PDF) »
        </a>
        <small>
          <p>Contributed by {$viewer.document.userOrgString}</p>
        </small>
      </div>

      {#if $viewer.me != null}
        <div class="actions">Document Actions</div>
        {#if $viewer.document.editAccess}
          <div class="action" on:click={() => showEmbedFlow($viewer.document)}>
            <h3>Embed</h3>
            <p>Make annotations to keep notes on the document.</p>
          </div>
          <div class="action" on:click={enterAnnotateMode}>
            <h3>Annotate</h3>
            <p>Make annotations to keep notes on the document.</p>
          </div>
          <div class="action" on:click={enterRedactMode}>
            <h3>Redact</h3>
            <p>
              Create redactions on the document to hide text. The document will
              reprocess afterwards.
            </p>
          </div>
          <div class="action" on:click={enterSectionsMode}>
            <h3>Edit sections</h3>
            <p>
              Add sections to organize your document with a table of contents.
            </p>
          </div>
        {:else}
          <div class="action" on:click={enterAnnotateMode}>
            <h3>Add Private Note</h3>
            <p>Make annotations to keep notes on the document.</p>
          </div>
        {/if}
      {/if}
      <SpecialMessage />
    {/if}

  </div>
{/if}
