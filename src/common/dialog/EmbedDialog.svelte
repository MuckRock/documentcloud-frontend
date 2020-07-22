<script>
  import Loader from "@/common/Loader";
  import Button from "@/common/Button";
  import Progress from "@/common/Progress";
  import emitter from "@/emit";
  import { getEmbed } from "@/api/document";
  import { queryBuilder } from "@/util/url";
  import { pushToast } from "@/manager/toast";
  import { changeAccess } from "@/api/document";
  import { wrapLoadSeparate } from "@/util/wrapLoad";

  // Stores
  import { viewer } from "@/viewer/viewer";
  import { layout } from "@/viewer/layout";
  import { writable } from "svelte/store";

  // SVG assets
  import errorIconSvg from "@/assets/error_icon.svg";
  import embedSvg from "@/assets/embed.svg";
  import linkSvg from "@/assets/link.svg";
  import twitterSvg from "@/assets/twitter.svg";

  const emit = emitter({
    dismiss() {}
  });

  function copy(elem) {
    elem.select();
    document.execCommand("copy");

    // Show toast
    pushToast("Copied to clipboard");
  }

  const baseWidth = 500;
  $: height =
    baseWidth * $layout.embedDocument.pageSizes[0] +
    $layout.headerHeight +
    $layout.footerHeight;
  let embedded = true;

  let loading = writable(false);

  let embedElem;
  let linkElem;

  $: embedUrl = queryBuilder($layout.embedDocument.canonicalUrl, {
    embed: embedded ? 1 : null,
    title: 1
  });

  let embedCode = null;

  $: {
    if (embedUrl != null) {
      getEmbed(embedUrl).then(({ html }) => (embedCode = html));
    }
  }

  async function makePublic() {
    await wrapLoadSeparate(loading, layout, async () => {
      await changeAccess([layout.embedDocument.id], "public");
      layout.embedDocument.doc = {
        ...layout.embedDocument.doc,
        status: "readable"
      };
      layout.embedDocument = layout.embedDocument;
      if (layout.embedContext == "viewer") {
        // Update viewer document as well
        viewer.document.doc = { ...viewer.document.doc, status: "readable" };
        viewer.document = viewer.document;
      }
    });
  }

  let embedOption = "document";
  let shareOption = "embed";
</script>

<style lang="scss">
  textarea {
    height: 100px;
  }

  input {
    width: 100%;
    max-width: 600px;
  }

  .preview {
    position: relative;
    margin-bottom: 25px;

    :global(iframe) {
      pointer-events: none;
    }

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: transparent;
    }
  }

  .warning {
    padding: 15px 30px;
    background: #ffeded;
    border-radius: 3px;
    display: table;
    max-width: 700px;

    &.readable {
      background: $fyi;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.24);
    }

    > * {
      display: table-cell;
      vertical-align: top;
    }

    .erroricon {
      padding-top: 20px;
      padding-right: 20px;
    }

    h2 {
      font-size: 18px;
    }
  }

  // .embedoptions {
  //   font-size: 0;
  //   border: solid 1px #a5a5a5;
  //   display: inline-block;
  //   border-radius: 3px;

  //   div {
  //     display: inline-block;
  //     background: #f7f7f7;
  //     margin: 0;
  //     font-size: 15px;
  //     padding: 3px 10px;
  //     border-right: solid 1px #a5a5a5;
  //     user-select: none;
  //     cursor: pointer;

  //     &:hover {
  //       background: #ebebeb;
  //     }

  //     &.selected {
  //       background: #dadada;
  //       -webkit-text-stroke: 0.3px;
  //     }

  //     &:first-child {
  //       border-top-left-radius: 3px;
  //       border-bottom-left-radius: 3px;
  //     }

  //     &:last-child {
  //       border-right: none;
  //       border-top-right-radius: 3px;
  //       border-bottom-right-radius: 3px;
  //     }
  //   }
  // }

  .shareoptions {
    margin: 19px 0;

    .shareoption {
      @include buttonLike;

      display: inline-block;
      padding: 14px 14px;
      border-radius: 3px;
      text-align: center;
      user-select: none;

      &.selected {
        background: #e1e1e1;
        cursor: default;
      }

      &:hover {
        background: #f4f4f4;

        &.selected {
          background: #e1e1e1;
          opacity: 1;
        }
      }
    }
  }

  .buttonpadded {
    margin-top: 12px !important;
  }

  textarea {
    height: 120px;
    max-width: 600px;
  }
</style>

<Loader active={$loading}>
  <div>
    <div class="mcontent">
      <h1>Share “{$layout.embedDocument.title}”</h1>

      {#if $layout.embedDocument.readable}
        <div class="warning readable">
          <div class="message">
            <h2>Updating document...</h2>
            <p>
              The document is currently updating. Once it is finished and made
              public, embedding and linking will work to share the document.
            </p>
            <div>
              <Progress initializing={true} progress={0} compact={true} />
            </div>
          </div>
        </div>
      {:else if $layout.embedDocument.access != 'public'}
        <div class="warning">
          <div class="erroricon">
            {@html errorIconSvg}
          </div>
          <div class="message">
            <h2>Make document public</h2>
            <p>
              The document is not currently public. If you embed or link it,
              only you and collaborators will be able to view it until it is
              made public. Click below when you’re ready to publish this
              document to the public.
            </p>
            <Button on:click={makePublic}>Make document public</Button>
          </div>
        </div>
      {/if}
      <!-- <div class="optionscontainer">
        <span>Type:</span>
        <div class="embedoptions">
          <div
            class:selected={embedOption == 'document'}
            on:click={() => (embedOption = 'document')}>
            Document
          </div>
          <div
            class:selected={embedOption == 'page'}
            on:click={() => (embedOption = 'page')}>
            Page
          </div>
          <div
            class:selected={embedOption == 'note'}
            on:click={() => (embedOption = 'note')}>
            Note
          </div>
        </div>
      </div> -->
      <div class="shareoptions">
        <div
          class="shareoption"
          class:selected={shareOption == 'embed'}
          on:click={() => (shareOption = 'embed')}>
          <div class="logo">
            {@html embedSvg}
          </div>
          <div class="name">Embed</div>
        </div>
        <div
          class="shareoption"
          class:selected={shareOption == 'link'}
          on:click={() => (shareOption = 'link')}>
          <div class="logo">
            {@html linkSvg}
          </div>
          <div class="name">Link</div>
        </div>
        <a
          target="_blank"
          href="https://twitter.com/intent/tweet?text={encodeURIComponent(`${$layout.embedDocument.title} ${$layout.embedDocument.canonicalUrl}`)}">
          <div class="shareoption">
            <div class="logo">
              {@html twitterSvg}
            </div>
            <div class="name">Twitter</div>
          </div>
        </a>
      </div>

      {#if shareOption == 'embed'}
        <p>
          Copy the HTML code to embed this document within an article or post:
        </p>

        {#if embedCode != null}
          <textarea bind:this={embedElem} value={embedCode} />
        {:else}
          <textarea disabled>Loading...</textarea>
        {/if}

        <div class="buttonpadded">
          <Button on:click={() => copy(embedElem)}>Copy code</Button>
        </div>

        {#if embedCode != null}
          <p>
            <b>Preview:</b>
          </p>
          <div class="preview">
            {@html embedCode}
          </div>
        {/if}
      {:else if shareOption == 'link'}
        <input
          bind:this={linkElem}
          value={$layout.embedDocument.canonicalUrl} />
        <div class="buttonpadded">
          <Button on:click={() => copy(linkElem)}>Copy URL</Button>
        </div>
      {/if}
    </div>
  </div>
</Loader>
