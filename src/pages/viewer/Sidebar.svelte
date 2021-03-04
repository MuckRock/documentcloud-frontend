<script>
  import TableOfContents from "./TableOfContents";
  import Progress from "@/common/Progress";
  import AccessIcon from "@/common/AccessIcon";
  import SpecialMessage from "@/common/SpecialMessage";
  import HtmlField from "@/common/HtmlField";

  import {
    enterRedactMode,
    enterAnnotateMode,
    enterInfoMode,
    enterDataMode,
    enterSectionsMode,
  } from "@/viewer/actions";
  import { layout, showEmbedFlow, cancelAnnotation } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";

  function handleMouseDown() {
    if ($layout.displayAnnotate) {
      cancelAnnotation();
    }
  }
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
      filter: brightness(90%);
      user-select: none;

      * {
        pointer-events: none;
      }
    }

    .updating {
      color: $gray;
      font-size: 12px;
      margin: 10px 0;
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

      &.disabled {
        background: #e8e8e8;
        opacity: 0.5;
        cursor: default;
        pointer-events: none;
      }

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

  .inlineheader {
    color: black;
    display: inline-block;
    vertical-align: middle;
  }
</style>

{#if $layout.showSidebar}
  <div
    class="sidebar"
    class:white={$viewer.me == null}
    class:disabled={$layout.disableControls}
    on:mousedown={handleMouseDown}
    style="top: {$layout.headerHeight}px; bottom: {$layout.footerHeight}px;
    width: {$layout.sidebarWidth}px"
  >
    {#if $viewer.loaded}
      <div class="title">
        {#if !$layout.embed && $viewer.document.readable}
          <div class="updating">
            Updating document...
            <Progress initializing={true} progress={0} compact={true} />
          </div>
        {/if}

        {#if $viewer.document.description != null && $viewer.document.description.trim().length > 0}
          <details class="dc" open>
            <summary>
              <h2 class="inlineheader">{$viewer.document.title}</h2>
            </summary>
            <HtmlField content={$viewer.document.description} />
          </details>
        {:else}
          <h2>{$viewer.document.title}</h2>
        {/if}

        <TableOfContents />

        <hr />
        {#if !$layout.hidePdfLink}
          <div>
            <a target="_blank" href={$viewer.document.pdf}>
              Original Document (PDF) »
            </a>
          </div>
        {/if}
        {#if $viewer.document.relatedArticleUrl != null && $viewer.document.relatedArticleUrl.trim().length > 0}
          <div>
            <a target="_blank" href={$viewer.document.relatedArticleUrl}>
              Related Article »
            </a>
          </div>
        {/if}
        <small>
          <p>Contributed by {$viewer.document.userOrgString}</p>
        </small>
        {#if $viewer.document.editAccess}
          <div>
            <AccessIcon document={$viewer.document} showText={true} />
          </div>
        {/if}
      </div>

      {#if $viewer.me != null}
        <div class="actions">Document Actions</div>
        {#if $viewer.document.editAccess}
          <div
            class="action"
            class:disabled={$viewer.document.readable}
            on:click={() => showEmbedFlow($viewer.document)}
          >
            <h3>Share</h3>
            <p>Create an embed or share on social media.</p>
          </div>
          <div class="action" on:click={enterAnnotateMode}>
            <h3>Annotate</h3>
            <p>Make annotations to keep notes on the document.</p>
          </div>
          <div
            class="action"
            class:disabled={$viewer.document.readable}
            on:click={enterRedactMode}
          >
            <h3>Redact</h3>
            <p>
              Create redactions on the document to hide text. The document will
              reprocess afterwards.
            </p>
          </div>
          <div
            class="action"
            class:disabled={$viewer.document.readable}
            on:click={enterInfoMode}
          >
            <h3>Edit Document Info</h3>
            <p>Modify document information like description and related URL.</p>
          </div>
          <div
            class="action"
            class:disabled={$viewer.document.readable}
            on:click={enterDataMode}
          >
            <h3>Edit Tags and Data</h3>
            <p>Add tags and key/value pairs to categorize your document.</p>
          </div>
          <div class="action" on:click={enterSectionsMode}>
            <h3>Edit Sections</h3>
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
      {#if !$layout.embed && $viewer.document.editAccess}
        <SpecialMessage />
        {#if $viewer.document.editAccess && $viewer.document.id < process.env.LEGACY_CUT_OFF}
          <div
            style="background: #fff782; display: block; padding: 2px 8px; border-radius: 3px; font-size: 13px; box-sizing: border-box; color: #312f05;"
          >
            Since this document was originally uploaded in the legacy version of
            DocumentCloud, if you’re deleting sensitive information after the
            document was published it may not automatically be redacted in all
            places. Please make your redactions and edits and then
            <a
              style="font-size: 13px; text-decoration: underline; color: #312f05"
              href="mailto:info@documentcloud?subject=Editing Sensitive Legacy Document"
              target="_blank">email us</a
            >
            so we can confirm the information is fully removed.
          </div>
        {/if}
      {/if}
    {/if}
  </div>
{/if}
