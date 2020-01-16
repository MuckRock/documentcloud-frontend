<script>
  import emitter from "@/emit";

  // SVG assets
  import hamburgerSvg from "@/assets/hamburger.svg";

  const emit = emitter({
    toggle() {}
  });

  // Boolean indicating if hamburger should be white
  // (e.g. if on a dark background)
  export let white;
</script>

<style lang="scss">
  .hamburger {
    user-select: none;
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    z-index: $hamburgerZ;
    background: $sidebar;
    padding: 1em 0;
    display: none;

    &.white {
      background: white;
    }

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

<div class="hamburger" class:white>
  <span class="svg" on:click={emit.toggle}>
    {@html hamburgerSvg}
  </span>
</div>
