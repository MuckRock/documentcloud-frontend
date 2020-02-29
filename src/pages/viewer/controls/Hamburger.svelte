<script>
  import { toggleSidebar } from "@/viewer/renderer";

  // SVG assets
  import viewerHamburgerSvg from "@/assets/viewer_hamburger.svg";
</script>

<style lang="scss">
  .hamburger {
    @include buttonLike;

    margin: 0 30px 0 10px;
  }
</style>

<div class="hamburger" on:click={toggleSidebar}>
  {@html viewerHamburgerSvg}
</div>
