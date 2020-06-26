<script>
  import { toggleSidebar } from "@/viewer/document";

  // SVG assets
  import viewerHamburgerSvg from "@/assets/viewer_hamburger.svg";
</script>

<style lang="scss">
  .hamburger {
    @include buttonLike;

    margin: 0 16px 0 5px;
  }
</style>

<div class="hamburger" on:click={toggleSidebar}>
  {@html viewerHamburgerSvg}
</div>
