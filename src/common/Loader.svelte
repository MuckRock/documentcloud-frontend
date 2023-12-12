<script>
  export let active;
  export let center = false;
  export let big = false;
  export let inline = false;
  export let transparent = true;
  export let pad = false;
</script>

<div class:loader={active} class:inline class:pad>
  {#if active}
    <div class="shim">
      <div class="spinner" class:center class:big />
    </div>
  {/if}
  <div class="contents" class:transparent>
    <slot />
  </div>
</div>

<style>
  div {
    --smallBordersize: 4px;
    --smallSpinsize: 10px;
    --bigBordersize: 7px;
    --bigSpinsize: 17px;
  }

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
  }

  .loader .contents.transparent {
    opacity: 0.1;
    transition: opacity 1s ease;
  }

  .loader .shim {
    display: block;
    pointer-events: inherit;
  }

  .loader.pad {
    display: inline-block;
    width: 30px;
    height: 36px;
    vertical-align: middle;
  }

  .spinner {
    position: absolute;
    left: 8px;
    top: 8px;
    border: var(--smallBordersize, 4px) solid transparent;
    border-top: var(--smallBordersize, 4px) solid
      var(--gray, rgba(0, 0, 0, 0.53));
    border-bottom: var(--smallBordersize, 4px) solid
      var(--gray, rgba(0, 0, 0, 0.53));
    border-radius: 50%;
    box-sizing: border-radius;
    width: var(--smallSpinsize, 10px);
    height: var(--smallSpinsize, 10px);
    animation:
      spin 1.5s cubic-bezier(0.65, 0.175, 0.355, 0.835) infinite,
      opaquify 1s ease;
    z-index: var(--spinnerZ, 8);
    opacity: 0;
  }
  .spinner.big {
    border: var(--bigBordersize, 7px) solid transparent;
    border-top: var(--bigBordersize, 7px) solid var(--gray, rgba(0, 0, 0, 0.53));
    border-bottom: var(--bigBordersize, 7px) solid
      var(--gray, rgba(0, 0, 0, 0.53));
    width: var(--bigSpinsize, 17px);
    height: var(--bigSpinsize, 17px);
    animation:
      spin 1.5s cubic-bezier(0.25, 0.175, 0.355, 0.57) infinite,
      opaquify 1s ease;
  }

  .spinner.center {
    top: calc(
      50% - var(--smallSpinsize, 10px) / 2 + var(--smallBordersize, 4px)
    );
    left: calc(
      50% - var(--smallSpinsize, 10px) / 2 + var(--smallBordersize, 4px)
    );
  }

  .spinner.center.big {
    top: calc(50% - var(--bigSpinsize, 17px) / 2 + var(--bigBordersize, 7px));
    left: calc(50% - var(--bigSpinsize, 17px) / 2 + var(--bigBordersize, 7px));
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
