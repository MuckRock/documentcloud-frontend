<script>
  import { onMount } from "svelte";
  import { layout } from "@/viewer/layout";
  import { coalesceHighlights } from "@/util/coalesceHighlights";
  import session from "@/api/session";
  import emitter from "@/emit";

  export let src;
  export let width;
  export let delay = null;
  export let highlights = null;

  export let aspect = null;

  let text = null;
  let ready = false;
  let gettingText = false;

  const emit = emitter({
    aspect() {}
  });

  let height;
  $: if (text != null && height != null) {
    emit.aspect(height / width);
  }

  $: if (ready && text == null && !gettingText) loadText();

  async function loadText() {
    gettingText = true;
    text = (await session.getStatic(src)).trim();
  }

  onMount(() => {
    if (delay == null) {
      loadText();
    } else {
      setTimeout(() => (ready = true), delay);
    }
  });

  // Highlights
  $: console.log("HIGHLIGHTS", regions);

  $: regions = coalesceHighlights(text, highlights);
</script>

<style lang="scss">
  .text {
    display: block;
    background: white;
    text-align: left;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: "Courier New", Courier, monospace;
    color: #333;
    line-height: 1.4;

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
</style>

{#if text != null}
  <div
    class="text"
    bind:clientHeight={height}
    style="font-size: {width / 50}px; padding: {width / 15}px;">
    {#each regions as region}
      {#if region.type == 'normal'}
        <span>{region.text}</span>
      {:else}
        <span class="highlight">{region.text}</span>
      {/if}
    {/each}
  </div>
{:else}
  <div class="text" style="height: {aspect * width}px" />
{/if}
