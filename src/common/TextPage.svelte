<script>
  import { onMount } from "svelte";
  import session from "@/api/session";
  import emitter from "@/emit";

  export let src;
  export let width;
  export let delay = null;

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
  }
</style>

{#if text != null}
  <div
    class="text"
    bind:clientHeight={height}
    style="font-size: {width / 50}px; padding: {width / 15}px;">
    {text == null ? '' : text}
  </div>
{:else}
  <div class="text" style="height: {aspect * width}px" />
{/if}
