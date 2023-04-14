<script>
  import TableOfContents from "./TableOfContents";
  import Progress from "@/common/Progress";
  import AccessIcon from "@/common/AccessIcon";
  import HtmlField from "@/common/HtmlField";
  import session from "@/api/session";
  import { jsonUrl } from "@/api/viewer";

  import {
    enterRedactMode,
    enterAnnotateMode,
    enterModifyMode,
    enterInfoMode,
    enterDataMode,
    enterSectionsMode,
  } from "@/viewer/actions";
  import { layout, showEmbedFlow, cancelAnnotation } from "@/viewer/layout";
  import { viewer } from "@/viewer/viewer";
  import { _ } from "svelte-i18n";

  function handleMouseDown() {
    if ($layout.displayAnnotate) {
      cancelAnnotation();
    }
  }

  let textDoc = null;
  let ocrEngine = null;
  let loading = false;
  let engineMap = { tess4: "Tesseract", textract: "Textract" };

  $: {
    if ($viewer.document != null && textDoc == null && !loading) {
      loading = true;
      (async () => {
        textDoc = await session.getStatic(jsonUrl(viewer.document));
        // strip _force if it exists
        ocrEngine = textDoc.pages[0].ocr;
        if (ocrEngine) {
          ocrEngine = ocrEngine.split("_")[0];
          // map to human readable
          ocrEngine = engineMap[ocrEngine];
        }
        loading = false;
      })();
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
            {$_("sidebar.updating")}
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
            <a
              target="_blank"
              rel="noopener noreferrer"
              class="plausible-event-name=viewer-original-document"
              href={$viewer.document.pdf}
            >
              {$_("sidebar.original")}
            </a>
          </div>
        {/if}
        {#if $viewer.document.relatedArticleUrl != null && $viewer.document.relatedArticleUrl.trim().length > 0}
          <div>
            <a
              target="_blank"
              rel="noopener noreferrer"
              class="plausible-event-name=viewer-related-url"
              href={$viewer.document.relatedArticleUrl}
            >
              {$_("sidebar.related")}
            </a>
          </div>
        {/if}
        <small>
          <p>
            {$_("sidebar.contributed", {
              values: {
                name: $layout.showOrg
                  ? $viewer.document.orgString
                  : $viewer.document.userOrgString,
              },
            })}
          </p>
        </small>
        {#if $viewer.document.source !== null && $viewer.document.source.trim().length > 0}
          <small>
            <p>
              {$_("sidebar.source", {
                values: { source: $viewer.document.source },
              })}
            </p>
          </small>
        {/if}
        {#if $viewer.document.editAccess}
          <div>
            <AccessIcon document={$viewer.document} showText={true} />
          </div>
        {/if}
        {#if ocrEngine}
          <small><p>OCR: {ocrEngine}</p></small>
        {/if}
      </div>

      {#if $viewer.me !== null}
        <div class="actions">{$_("sidebar.actions")}</div>
        {#if $viewer.document.editAccess}
          <div
            class="action plausible-event-name=sidebar-share"
            class:disabled={$viewer.document.readable}
            on:click={() => showEmbedFlow($viewer.document)}
          >
            <h3>{$_("sidebar.share")}</h3>
            <p>{$_("sidebar.shareDesc")}</p>
          </div>
          <div class="action" on:click={enterAnnotateMode}>
            <h3>{$_("sidebar.annotate")}</h3>
            <p>{$_("sidebar.annotateDesc")}</p>
          </div>
          <div
            class="action"
            class:disabled={$viewer.document.readable}
            on:click={enterRedactMode}
          >
            <h3>{$_("sidebar.redact")}</h3>
            <p>
              {$_("sidebar.redactDesc")}
            </p>
          </div>
          <div
            class="action"
            class:disabled={$viewer.document.readable}
            on:click={enterModifyMode}
          >
            <h3>{$_("sidebar.modify")}</h3>
            <p>{$_("sidebar.modifyDesc")}</p>
          </div>
          <div
            class="action"
            class:disabled={$viewer.document.readable}
            on:click={enterInfoMode}
          >
            <h3>{$_("sidebar.info")}</h3>
            <p>{$_("sidebar.infoDesc")}</p>
          </div>
          <div
            class="action"
            class:disabled={$viewer.document.readable}
            on:click={enterDataMode}
          >
            <h3>{$_("sidebar.data")}</h3>
            <p>{$_("sidebar.dataDesc")}</p>
          </div>
          <div class="action" on:click={enterSectionsMode}>
            <h3>{$_("sidebar.sections")}</h3>
            <p>{$_("sidebar.sectionsDesc")}</p>
          </div>
        {:else}
          <div class="action" on:click={enterAnnotateMode}>
            <h3>{$_("sidebar.privateNote")}</h3>
            <p>{$_("sidebar.privateNoteDesc")}</p>
          </div>
        {/if}
      {/if}
    {/if}
  </div>
{/if}
