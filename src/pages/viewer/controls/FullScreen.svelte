<script>
  // SVG assets
  import { ScreenFull24 } from "svelte-octicons";

  export let url;
</script>

{#if url}
  <a target="_blank" href={url}>
    <span class="fullscreen">
      <ScreenFull24 />
    </span>
  </a>
{/if}

<style>
  .fullscreen {
    display: inline-block;
    vertical-align: middle;
    margin: 0 10px 0 6px;
    line-height: 0;
  }

  .fullscreen :global(svg) {
    display: inline-block;
    vertical-align: middle;
  }
</style>
