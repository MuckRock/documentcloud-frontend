<script>
  export let active;
  export let center = false;
  export let big = false;
  export let inline = false;
</script>

<style lang="scss">
  .inline {
    display: inline-block;
  }

  .shim {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }

  .loader {
    pointer-events: none;
    position: relative;
    user-select: none;
    .contents {
      opacity: 0.1;
      transition: opacity 1s ease;
    }

    .shim {
      display: block;
      pointer-events: inherit;
    }
  }

  $smallBordersize: 4px;
  $smallSpinsize: 10px;
  $bigBordersize: 7px;
  $bigSpinsize: 17px;

  .spinner {
    position: absolute;
    left: 8px;
    top: 8px;
    border: $smallBordersize solid transparent;
    border-top: $smallBordersize solid $gray;
    border-bottom: $smallBordersize solid $gray;
    border-radius: 50%;
    box-sizing: border-radius;
    width: $smallSpinsize;
    height: $smallSpinsize;
    animation: spin 1.5s cubic-bezier(0.65, 0.175, 0.355, 0.835) infinite,
      opaquify 1s ease;
    z-index: $spinnerZ;
    opacity: 0;

    &.big {
      border: $bigBordersize solid transparent;
      border-top: $bigBordersize solid $gray;
      border-bottom: $bigBordersize solid $gray;
      width: $bigSpinsize;
      height: $bigSpinsize;
      animation: spin 1.5s cubic-bezier(0.25, 0.175, 0.355, 0.57) infinite,
        opaquify 1s ease;
    }

    &.center {
      top: calc(50% - #{$smallSpinsize / 2 + $smallBordersize});
      left: calc(50% - #{$smallSpinsize / 2 + $smallBordersize});

      &.big {
        top: calc(50% - #{$bigSpinsize / 2 + $bigBordersize});
        left: calc(50% - #{$bigSpinsize / 2 + $bigBordersize});
      }
    }
  }

  .loader .spinner {
    opacity: 1;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes opaquify {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>

<div class:loader={active} class:inline>
  {#if active}
    <div class="shim">
      <div class="spinner" class:center class:big />
    </div>
  {/if}
  <div class="contents">
    <slot />
  </div>
</div>
