<script>
  import Button from "@/common/Button";
  import emitter from "@/emit";
  import { getEmbed } from "@/api/document";
  import { queryBuilder } from "@/util/url";

  // Stores
  import { layout } from "@/viewer/layout";
  import { renderer } from "@/viewer/renderer";

  const emit = emitter({
    dismiss() {}
  });

  const baseWidth = 500;
  $: height =
    baseWidth * $layout.embedDocument.pageSizes[0] +
    $layout.headerHeight +
    $layout.footerHeight;
  let embedded = true;

  // TODO: use canonical URL
  $: embedUrl = queryBuilder($layout.embedDocument.canonicalUrl, {
    embed: embedded ? 1 : null
  });

  let embedCode = null;

  $: {
    if (embedUrl != null) {
      getEmbed(embedUrl).then(({ html }) => (embedCode = html));
    }
  }
</script>

<style lang="scss">
  textarea {
    height: 100px;
  }

  .preview {
    position: relative;

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
</style>

<div>
  <div class="mcontent">
    <h1>Embed Document ({$layout.embedDocument.title})</h1>
    <p>{$layout.embedDocument.access}</p>
    <div>
      <label>
        Embed mode:
        <input type="checkbox" bind:checked={embedded} />
      </label>
    </div>
    <p>
      <b>Preview:</b>
    </p>
    <div class="preview">
      {#if embedCode != null}
        {@html embedCode}
      {/if}
    </div>
    <p>
      <b>Embed code:</b>
    </p>
    <textarea readonly>{embedCode}</textarea>
    <div class="buttonpadded">
      <Button secondary={true} on:click={emit.dismiss}>Done</Button>
    </div>
  </div>
</div>
