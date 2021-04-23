<script>
  import Button from "@/common/Button";
  import { copy } from "@/util/copy";
  import { tick } from "svelte";

  // SVG assets
  import embedSvg from "@/assets/embed.svg";
  import linkSvg from "@/assets/link.svg";
  import twitterSvg from "@/assets/twitter.svg";

  export let shareOption = "embed";
  export let embedDescription;
  export let embedCode = null;
  export let embedAction = null;
  export let errorOccurred = false;
  export let linkText;
  export let tweetText;
  export let showWp = true;
  export let width = null;
  export let height = null;
  export let column = false;

  let embedElem;
  let wpElem;
  let linkElem;

  const ERROR_TEXT = "An unexpected error occurred. Please try again later.";

  $: embedText = errorOccurred ? ERROR_TEXT : embedCode;
  $: linkDisplayText = errorOccurred ? ERROR_TEXT : linkText;
  $: wpText = errorOccurred
    ? ERROR_TEXT
    : `[documentcloud url="${linkText}"${
        width != null ? ` width="${width}"` : ""
      }${height != null ? ` height="${height}"` : ""}]`;

  $: {
    if (embedCode != null && embedAction != null) {
      tick().then(() => embedAction());
    }
  }
</script>

<style lang="scss">
  $detailWidth: 600px;
  $detailPadding: 40px;

  .row {
    display: table;
    width: 100%;

    .column {
      display: table-cell;
      vertical-align: top;

      &.detail {
        width: $detailWidth + $detailPadding;
        padding-right: $detailPadding;
      }

      &.showcase {
        width: calc(100% - #{$detailWidth});
      }
    }
  }

  @media only screen and (max-width: $largeScreenBreak) {
    .row {
      display: block;

      .column {
        display: block;
        width: inherit !important;
        padding-right: 0 !important;
      }
    }
  }

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

  textarea {
    height: 120px;
    max-width: 600px;
  }

  input {
    width: 100%;
    max-width: 600px;
  }

  .preview {
    margin-bottom: 25px;
  }

  .buttonpadded {
    margin-top: 12px !important;
  }

  .error {
    color: $caution;
    margin-bottom: 12px;
    pointer-events: none;
  }

  a.link {
    color: $primary;
  }
</style>

<div class="shareoptions">
  <div
    class="shareoption"
    class:selected={shareOption == "embed"}
    on:click={() => (shareOption = "embed")}
  >
    <div class="logo">
      {@html embedSvg}
    </div>
    <div class="name">Embed</div>
  </div>
  <div
    class="shareoption"
    class:selected={shareOption == "link"}
    on:click={() => (shareOption = "link")}
  >
    <div class="logo">
      {@html linkSvg}
    </div>
    <div class="name">Link</div>
  </div>
  {#if !errorOccurred}
    <a
      target="_blank"
      href="https://twitter.com/intent/tweet?text={encodeURIComponent(
        tweetText,
      )}"
    >
      <div class="shareoption">
        <div class="logo">
          {@html twitterSvg}
        </div>
        <div class="name">Twitter</div>
      </div>
    </a>
  {/if}
</div>

{#if shareOption == "embed"}
  <div class="row">
    <div class="detail" class:column>
      <p>{embedDescription}</p>

      {#if embedText != null}
        <textarea
          class:error={errorOccurred}
          bind:this={embedElem}
          value={embedText}
        />
      {:else}<textarea disabled>Loading...</textarea>{/if}

      {#if !errorOccurred}
        <div class="buttonpadded">
          <Button on:click={() => copy(embedElem)}>Copy HTML code</Button>
        </div>
        {#if showWp}
          <p>
            Add this shortcode to your WordPress content —
            <a
              class="link"
              target="_blank"
              href="https://wordpress.org/plugins/documentcloud/"
            >
              plugin required
            </a>
          </p>
          <input
            class:error={errorOccurred}
            bind:this={wpElem}
            value={wpText}
          />
          <div class="buttonpadded">
            <Button on:click={() => copy(wpElem)}>Copy shortcode</Button>
          </div>
        {/if}
      {/if}

      <slot />
    </div>

    {#if embedCode != null}
      <div class="showcase" class:column>
        <p><b>Preview:</b></p>
        <div class="preview">
          {@html embedCode}
        </div>
      </div>
    {/if}
  </div>
{:else if shareOption == "link"}
  <input
    class:error={errorOccurred}
    bind:this={linkElem}
    value={linkDisplayText}
  />
  {#if !errorOccurred}
    <div class="buttonpadded">
      <Button on:click={() => copy(linkElem)}>Copy URL</Button>
    </div>
  {/if}
{/if}
