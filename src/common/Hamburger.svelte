<script>
  import emitter from "@/emit";

  // SVG assets
  import hamburgerSvg from "@/assets/hamburger.svg";

  const emit = emitter({
    toggle() {}
  });
</script>

<style lang="scss">
  .hamburger {
    user-select: none;
    position: fixed;
    top: 0;
    padding: 14px;
    z-index: $hamburgerZ;
    display: none;

    .svg {
      cursor: pointer;
    }

    .svg:hover {
      opacity: $hover-opacity;
    }
  }

  @media only screen and (max-width: 600px) {
    .hamburger {
      display: block;
    }
  }
</style>

<div class="hamburger">
  <span class="svg" on:click={emit.toggle}>
    {@html hamburgerSvg}
  </span>
</div>
