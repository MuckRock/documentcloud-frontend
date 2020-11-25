<script>
  import Button from "@/common/Button";
  import { layout } from "@/viewer/layout";
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

  let embedElem;
  let linkElem;

  const ERROR_TEXT = "An unexpected error occurred. Please try again later.";

  $: embedText = errorOccurred ? ERROR_TEXT : embedCode;
  $: linkDisplayText = errorOccurred ? ERROR_TEXT : linkText;

  $: {
    if (embedCode != null && embedAction != null) {
      tick().then(() => embedAction());
    }
  }
</script>

<style lang="scss">
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
</style>

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
  {#if !errorOccurred}
    <a
      target="_blank"
      href="https://twitter.com/intent/tweet?text={encodeURIComponent(tweetText)}">
      <div class="shareoption">
        <div class="logo">
          {@html twitterSvg}
        </div>
        <div class="name">Twitter</div>
      </div>
    </a>
  {/if}
</div>

{#if shareOption == 'embed'}
  <p>{embedDescription}</p>

  {#if embedText != null}
    <textarea
      class:error={errorOccurred}
      bind:this={embedElem}
      value={embedText} />
  {:else}<textarea disabled>Loading...</textarea>{/if}

  {#if !errorOccurred}
    <div class="buttonpadded">
      <Button on:click={() => copy(embedElem)}>Copy code</Button>
    </div>
  {/if}

  {#if embedCode != null}
    <p><b>Preview:</b></p>
    <div class="preview">
      {@html embedCode}
    </div>
  {/if}
{:else if shareOption == 'link'}
  <input
    class:error={errorOccurred}
    bind:this={linkElem}
    value={linkDisplayText} />
  {#if !errorOccurred}
    <div class="buttonpadded">
      <Button on:click={() => copy(linkElem)}>Copy URL</Button>
    </div>
  {/if}
{/if}
