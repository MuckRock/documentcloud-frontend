<script>
  import { viewer } from "@/viewer/viewer";

  // SVG assets
  import fullScreenSvg from "@/assets/fullscreen.svg";
</script>

<style lang="scss">
  .fullscreen {
    @include buttonLike;
    display: inline-block;
    vertical-align: middle;
    margin: 0 10px 0 6px;
    line-height: 0;

    :global(svg) {
      display: inline-block;
      vertical-align: middle;
    }
  }
</style>

{#if $viewer.loaded}
  <a target="_blank" href={$viewer.document.canonicalUrl}>
    <span class="fullscreen">
      {@html fullScreenSvg}
    </span>
  </a>
{:else}
  <span class="fullscreen">
    {@html fullScreenSvg}
  </span>
{/if}
