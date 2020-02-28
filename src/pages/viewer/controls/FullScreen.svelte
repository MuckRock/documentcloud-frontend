<script>
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

<span class="fullscreen">
  {@html fullScreenSvg}
</span>
