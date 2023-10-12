<script>
  import Loader from "@/common/Loader.svelte";
  import Button from "@/common/Button.svelte";
  import Progress from "@/common/Progress.svelte";
  import DocumentEmbedDialog from "./DocumentEmbedDialog.svelte";
  import PageEmbedDialog from "./PageEmbedDialog.svelte";
  import NoteEmbedDialog from "./NoteEmbedDialog.svelte";
  import { wrapLoadSeparate } from "@/util/wrapLoad.js";
  import { changeAccess } from "@/api/document.js";
  import { enterSelectNoteMode } from "@/viewer/actions.js";
  import { _ } from "svelte-i18n";

  // Stores
  import { viewer } from "@/viewer/viewer.js";
  import { layout } from "@/viewer/layout.js";
  import { writable } from "svelte/store";

  // SVG assets
  import errorIconSvg from "@/assets/error_icon.svg?raw";
  import shareDocumentSvg from "@/assets/share_document.svg?raw";
  import sharePageSvg from "@/assets/share_page.svg?raw";
  import shareNoteSvg from "@/assets/share_note.svg?raw";

  let loading = writable(false);
  let skipPublic = false;
  let shareHover = null;
  $: hasNotes = $viewer.notes != null && $viewer.notes.length > 0;

  async function makePublic() {
    await wrapLoadSeparate(loading, layout, async () => {
      await changeAccess([layout.embedDocument.id], "public");
      layout.embedDocument.doc = {
        ...layout.embedDocument.doc,
        status: "readable",
      };
      layout.embedDocument = layout.embedDocument;
      if (layout.embedContext == "viewer") {
        // Update viewer document as well
        viewer.document.doc = { ...viewer.document.doc, status: "readable" };
        viewer.document = viewer.document;
      }
    });
  }

  function selectNote() {
    enterSelectNoteMode();
  }
</script>

<style lang="scss">
  .warning {
    padding: 15px 30px;
    background: $warning;
    border-radius: $radius;
    display: table;
    max-width: 700px;

    &.readable {
      background: $fyi;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.24);
      margin-bottom: 35px;
    }

    > * {
      display: table-cell;
      vertical-align: top;
    }

    .erroricon {
      padding-top: 20px;
      padding-right: 20px;
    }
  }

  .shareoptions {
    display: table;
    margin: 25px 0 25px -10px;
    $border: solid 2px gainsboro;
    border-collapse: separate;
    border-spacing: 10px 0;

    @media only screen and (max-width: 720px) {
      margin-left: -5px;
      border-spacing: 5px 0;
    }

    .shareicon,
    .sharedescription {
      display: table-row;
    }

    .sharecell {
      display: table-cell;
      text-align: center;
      padding: 0 20px;
      cursor: pointer;
      border-left: $border;
      border-right: $border;

      &.hover {
        background: $viewerPaneColor;

        &.faded {
          background: inherit;
        }
      }

      @media only screen and (max-width: 720px) {
        padding: 0 7px;
        text-align: left;

        :global(svg) {
          width: 80%;
        }
      }
    }

    .shareicon {
      .sharecell {
        vertical-align: middle;
        padding-top: 15px;
        border-top-left-radius: $radius;
        border-top-right-radius: $radius;
        border-top: $border;
      }
    }

    .sharedescription {
      .sharecell {
        vertical-align: middle;
        padding-bottom: 10px;
        border-bottom-left-radius: $radius;
        border-bottom-right-radius: $radius;
        border-bottom: $border;
      }

      h2 {
        font-size: 16px;
        font-weight: 600;
      }

      p {
        text-align: left;
        font-size: 14px;
        color: $gray;
        max-width: 150px;
      }
    }
  }

  .faded {
    pointer-events: none;

    > :global(*) {
      opacity: 0.2;
    }
  }
</style>

<Loader active={$loading}>
  <div>
    <div class="mcontent">
      {#if $layout.embedNote != null}
        <NoteEmbedDialog />
      {:else if $layout.embedShareOption == null}
        {#if $layout.embedDocument.readable}
          <div class="warning readable">
            <div class="message">
              <h2>{$_("dialogEmbedDialog.updatingDocument")}</h2>
              <p>
                {$_("dialogEmbedDialog.makingPublic")}
              </p>
              <div>
                <Progress initializing={true} progress={0} compact={true} />
              </div>
            </div>
          </div>
        {:else if $layout.embedDocument.access != "public" && !skipPublic}
          <!-- Step 0. Make public if not already -->
          <h1>{$_("dialogEmbedDialog.wouldMakePublic")}</h1>
          <div class="warning">
            <div class="erroricon">
              {@html errorIconSvg}
            </div>
            <div class="message">
              <p>
                {$_("dialogEmbedDialog.notPublic")}
              </p>
            </div>
          </div>
          <div class="buttonpadded">
            <Button on:click={makePublic}
              >{$_("dialogEmbedDialog.makePublic")}</Button
            >
            <Button secondary={true} on:click={() => (skipPublic = true)}>
              {$_("dialogEmbedDialog.leave")}
            </Button>
          </div>
        {:else}
          <!-- Step 1: Choose embed type -->
          <h1>{$_("dialogEmbedDialog.selectShare")}</h1>
          <p>
            {$_("dialogEmbedDialog.selectShareHelp")}
          </p>
          <div class="shareoptions">
            <div class="shareicon">
              <div
                class="sharecell"
                class:hover={shareHover == "document"}
                on:mouseover={() => (shareHover = "document")}
                on:mouseout={() => (shareHover = null)}
                on:click={() => (layout.embedShareOption = "document")}
              >
                {@html shareDocumentSvg}
              </div>
              <div
                class="sharecell"
                class:hover={shareHover == "page"}
                on:mouseover={() => (shareHover = "page")}
                on:mouseout={() => (shareHover = null)}
                on:click={() => (layout.embedShareOption = "page")}
              >
                {@html sharePageSvg}
              </div>
              <div
                class="sharecell"
                class:faded={!hasNotes}
                class:hover={shareHover == "note"}
                on:mouseover={() => (shareHover = "note")}
                on:mouseout={() => (shareHover = null)}
                on:click={selectNote}
              >
                {@html shareNoteSvg}
              </div>
            </div>

            <div class="sharedescription">
              <div
                class="sharecell"
                class:hover={shareHover == "document"}
                on:mouseover={() => (shareHover = "document")}
                on:mouseout={() => (shareHover = null)}
                on:click={() => (layout.embedShareOption = "document")}
              >
                <h2>{$_("dialogEmbedDialog.shareDoc")}</h2>
                <p>
                  {$_("dialogEmbedDialog.shareDocHelp")}
                </p>
              </div>
              <div
                class="sharecell"
                class:hover={shareHover == "page"}
                on:mouseover={() => (shareHover = "page")}
                on:mouseout={() => (shareHover = null)}
                on:click={() => (layout.embedShareOption = "page")}
              >
                <h2>{$_("dialogEmbedDialog.sharePage")}</h2>
                <p>
                  {$_("dialogEmbedDialog.sharePageHelp")}
                </p>
              </div>
              <div
                class="sharecell"
                class:faded={!hasNotes}
                style="opacity: 1"
                class:hover={shareHover == "note"}
                on:mouseover={() => (shareHover = "note")}
                on:mouseout={() => (shareHover = null)}
                on:click={selectNote}
              >
                <h2 class:faded={!hasNotes}>
                  {$_("dialogEmbedDialog.shareNote")}
                </h2>
                <p>
                  {#if hasNotes}
                    {$_("dialogEmbedDialog.shareNoteHelpHasNote")}
                  {:else}
                    {$_("dialogEmbedDialog.shareNoteHelpNoNote")}
                  {/if}
                </p>
              </div>
            </div>
          </div>
        {/if}
      {:else if $layout.embedShareOption == "document"}
        <DocumentEmbedDialog />
      {:else if $layout.embedShareOption == "page"}
        <PageEmbedDialog />
      {/if}
    </div>
  </div>
</Loader>
