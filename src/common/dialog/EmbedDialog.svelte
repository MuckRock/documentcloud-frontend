<script>
  import Loader from "@/common/Loader";
  import Button from "@/common/Button";
  import Progress from "@/common/Progress";
  import DocumentEmbedDialog from "./DocumentEmbedDialog";
  import PageEmbedDialog from "./PageEmbedDialog";
  import NoteEmbedDialog from "./NoteEmbedDialog";
  import { wrapLoadSeparate } from "@/util/wrapLoad";
  import { changeAccess } from "@/api/document";
  import { enterSelectNoteMode } from "@/viewer/actions";

  // Stores
  import { viewer } from "@/viewer/viewer";
  import { layout } from "@/viewer/layout";
  import { writable } from "svelte/store";

  // SVG assets
  import errorIconSvg from "@/assets/error_icon.svg";
  import shareDocumentSvg from "@/assets/share_document.svg";
  import sharePageSvg from "@/assets/share_page.svg";
  import shareNoteSvg from "@/assets/share_note.svg";

  let loading = writable(false);
  let skipPublic = false;
  let shareHover = null;
  let shareOption = null;
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
    background: #ffeded;
    border-radius: 3px;
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

    @media only screen and (max-width: $mobileBreak) {
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

      @media only screen and (max-width: $mobileBreak) {
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
      {:else if shareOption == null}
        {#if $layout.embedDocument.readable}
          <div class="warning readable">
            <div class="message">
              <h2>Updating document...</h2>
              <p>
                The document is currently being made public. This may take a
                minute or two.
              </p>
              <div>
                <Progress initializing={true} progress={0} compact={true} />
              </div>
            </div>
          </div>
        {:else if $layout.embedDocument.access != 'public' && !skipPublic}
          <!-- Step 0. Make public if not already -->
          <h1>Would you like to make this document public before sharing?</h1>
          <div class="warning">
            <div class="erroricon">
              {@html errorIconSvg}
            </div>
            <div class="message">
              <p>
                The document is not currently public. If you embed or link it,
                only you and collaborators will be able to view it until it is
                made public. Click below when you’re ready to publish this
                document to the public.
              </p>
            </div>
          </div>
          <div class="buttonpadded">
            <Button on:click={makePublic}>Make document public</Button>
            <Button secondary={true} on:click={() => (skipPublic = true)}>
              Leave as is
            </Button>
          </div>
        {:else}
          <!-- Step 1: Choose embed type -->
          <h1>Select share option</h1>
          <p>
            Choose whether to share the entire document or just a page or note.
          </p>
          <div class="shareoptions">
            <div class="shareicon">
              <div
                class="sharecell"
                class:hover={shareHover == 'document'}
                on:mouseover={() => (shareHover = 'document')}
                on:mouseout={() => (shareHover = null)}
                on:click={() => (shareOption = 'document')}>
                {@html shareDocumentSvg}
              </div>
              <div
                class="sharecell"
                class:hover={shareHover == 'page'}
                on:mouseover={() => (shareHover = 'page')}
                on:mouseout={() => (shareHover = null)}
                on:click={() => (shareOption = 'page')}>
                {@html sharePageSvg}
              </div>
              <div
                class="sharecell"
                class:faded={!hasNotes}
                class:hover={shareHover == 'note'}
                on:mouseover={() => (shareHover = 'note')}
                on:mouseout={() => (shareHover = null)}
                on:click={selectNote}>
                {@html shareNoteSvg}
              </div>
            </div>

            <div class="sharedescription">
              <div
                class="sharecell"
                class:hover={shareHover == 'document'}
                on:mouseover={() => (shareHover = 'document')}
                on:mouseout={() => (shareHover = null)}
                on:click={() => (shareOption = 'document')}>
                <h2>Share entire document</h2>
                <p>
                  Link or embed the entire document. (This is the most commonly
                  used share option.)
                </p>
              </div>
              <div
                class="sharecell"
                class:hover={shareHover == 'page'}
                on:mouseover={() => (shareHover = 'page')}
                on:mouseout={() => (shareHover = null)}
                on:click={() => (shareOption = 'page')}>
                <h2>Share specific page</h2>
                <p>
                  Link or embed a single page of the document. Useful for
                  highlighting a page excerpt.
                </p>
              </div>
              <div
                class="sharecell"
                class:faded={!hasNotes}
                style="opacity: 1"
                class:hover={shareHover == 'note'}
                on:mouseover={() => (shareHover = 'note')}
                on:mouseout={() => (shareHover = null)}
                on:click={selectNote}>
                <h2 class:faded={!hasNotes}>Share specific note</h2>
                <p>
                  {#if hasNotes}
                    Link or embed a note within the document. Useful for
                    highlighting a region of a page.
                  {:else}
                    Once you add notes to the document, use this feature to link
                    or embed them.
                  {/if}
                </p>
              </div>
            </div>
          </div>
        {/if}
      {:else if shareOption == 'document'}
        <DocumentEmbedDialog />
      {:else if shareOption == 'page'}
        <PageEmbedDialog />
      {/if}
    </div>
  </div>
</Loader>
