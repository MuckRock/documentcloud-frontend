<script>
  import { onMount } from "svelte";
  import { layout } from "@/viewer/layout";
  import { coalesceHighlights } from "@/util/coalesceHighlights";

  export let text = "";
  export let highlights = null;

  // Highlights
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
    user-select: text;
    padding: 16px 20px;

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

<div class="text">
  {#each regions as region}
    {#if region.type == 'normal'}
      <span>{region.text}</span>
    {:else}
      <span class="highlight">{region.text}</span>
    {/if}
  {/each}
</div>
