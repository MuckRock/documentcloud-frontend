<script>
  import { onMount } from "svelte";
  import { layout } from "@/viewer/layout";
  import { coalesceHighlights } from "@/util/coalesceHighlights";
  import session from "@/api/session";
  import emitter from "@/emit";

  export let aspect = null;
  export let rawAspect = null;
  export let src;
  export let delay = null;
  export let highlights = null;
  export let cachedText = null;
  export let width = 0;

  let text = null;
  let ready = false;
  let gettingText = false;

  const EXTRA_HEIGHT = 0.02; // multiplier of padding to ensure text fits

  $: extraStyle = aspect == null ? "" : ` height: ${width * aspect}px`;

  const emit = emitter({
    aspect() {},
    text() {}
  });

  let height;
  $: if (rawAspect == null && text != null && height != null) {
    emit.aspect((height * (1 + EXTRA_HEIGHT)) / width);
  }

  $: if (ready && text == null && !gettingText) loadText();

  async function loadText() {
    gettingText = true;
    text = await session.getStatic(src);
    emit.text(text);
  }

  onMount(() => {
    if (cachedText != null) {
      text = cachedText;
      return;
    }
    if (delay == null) {
      loadText();
    } else {
      setTimeout(() => (ready = true), delay);
    }
  });

  // Highlights
  $: regions = coalesceHighlights(text, highlights);
</script>

<style lang="scss">
  .page {
    background: white;

    .text {
      display: block;
      text-align: left;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: "Courier New", Courier, monospace;
      color: #333;
      line-height: 1.4;
      user-select: text;

      .highlight {
        background: #f3e94d;
        background: linear-gradient(#f3e94d, #f5dd01);
        border: 1px solid #f5e800;
        padding: 1px;
        color: #000;
        border-radius: $radius;
        box-shadow: 0 0 5px #666;
      }
    }
  }
</style>

<div class="page" style={extraStyle}>
  {#if text != null}
    <div
      class="text"
      style="font-size: {width / 40}px; padding: {width / 120}px {width / 60}px;"
      bind:clientHeight={height}>
      {#each regions as region}
        {#if region.type == 'normal'}
          <span>{region.text}</span>
        {:else}
          <span class="highlight">{region.text}</span>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="text" />
  {/if}
</div>
