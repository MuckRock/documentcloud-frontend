<script>
  import { dismiss } from "@/manager/toast";
  import { onMount } from "svelte";

  // SVG assets
  import closeSimpleSvg from "@/assets/close_simple.svg";

  // Constants
  let toastLength = parseInt(process.env.TOAST_LENGTH);
  let toastFade = parseInt(process.env.TOAST_FADE);

  export let toast;
  export let i;

  let toastTimeout = null;
  let fading = false;

  function reset() {
    fading = false;

    if (toastTimeout != null) {
      clearTimeout(toastTimeout);
    }
    toastTimeout = setTimeout(beginClose, toastLength);
  }

  function beginClose() {
    fading = true;
    toastTimeout = setTimeout(() => dismiss(i), toastFade);
  }

  onMount(() => {
    toastTimeout = setTimeout(beginClose, toastLength);
  });
</script>

<style lang="scss">
  .toast {
    background: rgba(mix($annotationBorder, white, 30%), 0.9);
    border: solid 1px $annotationBorder;
    padding: 5px 10px;
    margin: 10px;
    border-radius: 3px;
    box-shadow: 0 0 2px #0000003d;
    color: mix($annotationBorder, black, 30%);
    display: inline-block;
    max-width: 50ch;
    text-align: left;
    pointer-events: all;
    opacity: 1;
    transition: opacity 0.8s ease;
    cursor: pointer;

    &.fading {
      opacity: 0;
    }

    &:hover {
      background: rgba(mix($annotationBorder, white, 30%), 0.95);
    }

    .x {
      @include buttonLike;

      padding: 0 10px 0 5px;
      font-size: 16px;
    }

    .content {
      user-select: none;
    }

    > * {
      display: table-cell;
      vertical-align: top;
    }
  }
</style>

<div
  class="toast"
  class:fading
  on:click={() => dismiss(i)}
  on:mouseover={reset}
  on:mousemove={reset}
>
  <span class="x">×</span>
  <span class="content">{toast.content}</span>
</div>
