<script lang="ts">
  import TableOfContents from "./TableOfContents.svelte";
  import Progress from "../../common/Progress.svelte";
  import AccessIcon from "../../common/AccessIcon.svelte";
  import HtmlField from "../../common/HtmlField.svelte";
  import session from "../../api/session.js";
  import { jsonUrl } from "../../api/viewer.js";

  import {
    enterRedactMode,
    enterAnnotateMode,
    enterModifyMode,
    enterInfoMode,
    enterDataMode,
    enterSectionsMode,
  } from "../../viewer/actions";
  import { showEmbedFlow, cancelAnnotation } from "../../viewer/layout.js";
  import { _ } from "svelte-i18n";
  import { FOOTER_HEIGHT, HEADER_HEIGHT, SIDEBAR_WIDTH } from "./constants";
  import SidebarAction from "./SidebarAction.svelte";

  export let document: any;
  export let signedIn: Boolean;
  export let loaded = false;
  export let embed = false;
  export let hidePdfLink = false;
  export let showOrg = false;
  export let displayAnnotate = false;
  export let disableControls = false;

  const style = `top: ${HEADER_HEIGHT}px; bottom: ${FOOTER_HEIGHT}px; width: ${SIDEBAR_WIDTH}px;`;

  function handleMouseDown() {
    if (displayAnnotate) {
      cancelAnnotation();
    }
  }

  let textDoc = null;
  let ocrEngine = null;
  let loading = false;
  let engineMap = {
    tess4: "Tesseract",
    textract: "Textract",
    googlecv: "Google Cloud Vision",
    ocrspace1: "OCRSpace",
    azuredi: "Azure Document Intelligence",
    doctr: "docTR",
  };

  interface Action {
    id: string;
    action: () => void;
    header: string;
    description: string;
    disabled?: boolean;
  }

  let actions: Action[] = [
    {
      id: "share",
      action: () => showEmbedFlow(document),
      header: $_("sidebar.share"),
      description: $_("sidebar.shareDesc"),
      disabled: document.readable,
    },
    {
      id: "annotate",
      action: enterAnnotateMode,
      header: $_("sidebar.annotate"),
      description: $_("sidebar.annotateDesc"),
    },
    {
      id: "redact",
      action: enterRedactMode,
      header: $_("sidebar.redact"),
      description: $_("sidebar.redactDesc"),
      disabled: document.readable,
    },
    {
      id: "modify",
      action: enterModifyMode,
      header: $_("sidebar.modify"),
      description: $_("sidebar.modifyDesc"),
      disabled: document.readable,
    },
    {
      id: "info",
      action: enterInfoMode,
      header: $_("sidebar.info"),
      description: $_("sidebar.infoDesc"),
      disabled: document.readable,
    },
    {
      id: "data",
      action: enterDataMode,
      header: $_("sidebar.data"),
      description: $_("sidebar.dataDesc"),
      disabled: document.readable,
    },
    {
      id: "sections",
      action: enterSectionsMode,
      header: $_("sidebar.sections"),
      description: $_("sidebar.sectionsDesc"),
    },
  ];

  $: {
    if (document != null && textDoc == null && !loading) {
      loading = true;
      (async () => {
        textDoc = await session.getStatic(jsonUrl(document));
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
    z-index: var(--viewerSidebarZ, 7);
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
      color: var(--gray, rgba(0, 0, 0, 0.53));
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
      color: var(--viewerLink, #004276);
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

<div
  class="sidebar"
  class:white={!signedIn}
  class:disabled={disableControls}
  on:mousedown={handleMouseDown}
  {style}
>
  {#if loaded}
    <div class="title">
      {#if !embed && document.readable}
        <div class="updating">
          {$_("sidebar.updating")}
          <Progress initializing={true} progress={0} compact={true} />
        </div>
      {/if}

      {#if document.description != null && document.description.trim().length > 0}
        <details class="dc" open>
          <summary>
            <h2 class="inlineheader">{document.title}</h2>
          </summary>
          <HtmlField content={document.description} />
        </details>
      {:else}
        <h2>{document.title}</h2>
      {/if}

      <TableOfContents />

      <hr />
      {#if !hidePdfLink}
        <div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            class="plausible-event-name=viewer-original-document"
            href={document.pdf}
          >
            {$_("sidebar.original")}
          </a>
        </div>
      {/if}
      {#if document.relatedArticleUrl != null && document.relatedArticleUrl.trim().length > 0}
        <div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            class="plausible-event-name=viewer-related-url"
            href={document.relatedArticleUrl}
          >
            {$_("sidebar.related")}
          </a>
        </div>
      {/if}
      <small>
        <p>
          {$_("sidebar.contributed", {
            values: {
              name: showOrg ? document.orgString : document.userOrgString,
            },
          })}
        </p>
      </small>
      {#if document.source !== null && document.source.trim().length > 0}
        <small>
          <p>
            {$_("sidebar.source", {
              values: { source: document.source },
            })}
          </p>
        </small>
      {/if}
      {#if document.editAccess}
        <div>
          <AccessIcon {document} showText={true} />
        </div>
      {/if}
      {#if ocrEngine}
        <small><p>OCR: {ocrEngine}</p></small>
      {/if}
    </div>

    {#if signedIn}
      <div class="actions">{$_("sidebar.actions")}</div>
      {#if document.editAccess}
        {#each actions as { id, action, header, description, disabled }}
          <SidebarAction
            class={`plausible-event-name=sidebar-${id}`}
            {disabled}
            {action}
            {header}
            {description}
          />
        {/each}
      {:else}
        <SidebarAction
          class="plausible-event-name=sidebar-private-note"
          action={enterAnnotateMode}
          header={$_("sidebar.privateNote")}
          description={$_("sidebar.privateNoteDesc")}
        />
      {/if}
    {/if}
  {/if}
</div>
