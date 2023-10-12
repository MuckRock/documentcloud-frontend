<script>
  import { toggleSidebar } from "@/viewer/document.js";

  // SVG assets
  import viewerHamburgerSvg from "@/assets/viewer_hamburger.svg?raw";
</script>

<style lang="scss">
  .hamburger {
    background: none;
    border: none;
    cursor: pointer;
    margin: 0.5em;
  }
</style>

<button
  class="hamburger plausible-event-name=viewer-hamburger"
  on:click={toggleSidebar}
>
  {@html viewerHamburgerSvg}
</button>
