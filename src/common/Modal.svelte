<script>
  import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
  import { onMount, onDestroy } from "svelte";
  import emitter from "@/emit";

  // SVG assets
  import closeSvg from "@/assets/close.svg";

  const emit = emitter({
    close() {}
  });

  let dismissable = true;
  export let component;
  export let properties = {};

  // The modal element
  let modal;

  function dismiss() {
    if (dismissable) emit.close();
  }

  function setDismissable({ detail }) {
    dismissable = detail;
  }

  function handleKeyDown(e) {
    if (e.key == "Escape") dismiss();
  }

  onMount(() => {
    disableBodyScroll(modal);
  });

  onDestroy(() => {
    enableBodyScroll(modal);
  });
</script>

<style lang="scss">
  .shim {
    background: #051d38b5;
    z-index: $modalShimZ;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  .modalcontainer {
    z-index: $modalContainerZ;
    position: fixed;
    top: 10vh;
    left: 20vw;
    height: 80vh;
    width: 60vw;
    display: table;
    pointer-events: none;
    -webkit-overflow-scrolling: touch;
  }

  .modalintermediate {
    display: table-cell;
    vertical-align: middle;
    pointer-events: none;
    -webkit-overflow-scrolling: touch;
  }

  .modal {
    box-sizing: border-box;
    overflow-y: auto;
    background: white;
    border-radius: $radius;
    color: black;
    padding: 0;
    box-shadow: $overlay-shadow;
    position: relative;
    max-height: 80vh;
    max-width: 766px;
    margin: 0 auto;
    text-align: left;
    pointer-events: all;
    -webkit-overflow-scrolling: touch;

    :global(h1) {
      font-size: 18px;
      font-weight: 600;
    }

    :global(.mcontent) {
      padding: 0 $modal-horiz-padding;
    }

    :global(.buttonpadded) {
      margin: 25px 0 25px -5px;

      :global(button) {
        margin: 0 5px;
      }
    }

    :global(.inputpadded) {
      padding: 12px 0;
      :global(input) {
        padding: 4px 10px;
        font-family: inherit;
        font-size: 16px;
        border-radius: 3px;
        border: solid 1px gainsboro;
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.06);
      }
    }
  }

  @media only screen and (max-width: 600px) {
    .modalcontainer {
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
    }
  }

  .header {
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    height: $modal-vert-padding;
    margin-bottom: 2px;
    z-index: $modalHeaderZ;
  }

  :global(.close) {
    user-select: none;
    margin-left: 12px;
    margin-top: 12px;

    &:hover {
      opacity: $hover-opacity;
      cursor: pointer;
    }
  }
</style>

<svelte:window on:keydown={handleKeyDown} />

<div>
  <div class="shim" on:click={dismiss} />
  <div class="modalcontainer">
    <div class="modalintermediate">
      <div bind:this={modal} class="modal">
        <div class="header">
          {#if dismissable}
            <span on:click={dismiss}>
              {@html closeSvg}
            </span>
          {/if}
        </div>

        <svelte:component
          this={component}
          {...properties}
          on:setDismissable={setDismissable}
          on:dismiss={dismiss} />
      </div>
    </div>
  </div>
</div>
