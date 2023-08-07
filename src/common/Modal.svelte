<script>
  import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
  import { onMount, onDestroy } from "svelte";

  import { layout } from "@/manager/layout.js";
  import emitter from "@/emit.js";

  // SVG assets
  import closeSvg from "@/assets/close.svg";

  const emit = emitter({
    close() {},
  });

  let dismissable = true;
  export let component;
  export let fullscreen = false;
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
    if (e.key === "Escape") dismiss();
  }

  onMount(() => {
    disableBodyScroll(modal);
    // Exit out of sidebar
    layout.sidebarExpanded = false;
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
    .modal {
      width: 60vw;
    }

    .fullscreen & {
      top: 2.5vh;
      left: 2.5vw;
      height: 95vh;
      width: 95vw;
      .modal {
        width: 95vw;
      }
    }
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

    .fullscreen & {
      max-height: 95vh;
      max-width: 95vw;
    }

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
    }
  }

  @media only screen and (max-width: $mobileBreak) {
    .modalcontainer {
      top: 0;
      left: 0;
      height: 100%;
      width: 100vw;

      .modal {
        width: 100vw;
      }
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
    @include buttonLike;

    user-select: none;
    margin-left: $closePadding;
    margin-top: $closePadding;
  }

  button.dismiss {
    background: none;
    padding: none;
    border: none;
  }
</style>

<svelte:window on:keydown={handleKeyDown} />

<div class:fullscreen>
  <div class="shim" on:click={dismiss} />
  <div class="modalcontainer">
    <div class="modalintermediate">
      <div bind:this={modal} class="modal">
        <div class="header">
          {#if dismissable}
            <button class="dismiss" on:click={dismiss}>
              {@html closeSvg}
            </button>
          {/if}
        </div>

        <svelte:component
          this={component}
          {...properties}
          on:setDismissable={setDismissable}
          on:dismiss={dismiss}
        />
      </div>
    </div>
  </div>
</div>
