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
  export let linkText;
  export let tweetText;

  let embedElem;
  let linkElem;

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
</div>

{#if shareOption == 'embed'}
  <p>{embedDescription}</p>

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
  <input bind:this={linkElem} value={linkText} />
  <div class="buttonpadded">
    <Button on:click={() => copy(linkElem)}>Copy URL</Button>
  </div>
{/if}
