<script>
  import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
  import { onMount, onDestroy } from "svelte";

  import { layout } from "@/manager/layout.js";
  import emitter from "@/emit.js";

  // SVG assets
  import { XCircle24 } from "svelte-octicons";

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
    z-index: var(--modalShimZ, 20);
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  .modalcontainer {
    z-index: var(--modalContainerZ, 21);
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
    border-radius: var(--radius, 3px);
    color: black;
    padding: 0;
    box-shadow: var(--overlay-shadow, 2px 2px 4px rgba(0, 0, 0, 0.25));
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
      padding: 0 var(--modal-horiz-padding, 42px);
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

  @media only screen and (max-width: 720px) {
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
    height: var(--modal-vert-padding, 44px);
    margin-bottom: 2px;
    z-index: var(--modalHeaderZ, 22);
  }

  .dismiss :global(svg) {
    user-select: none;
    margin-left: var(--closePadding, 12px);
    margin-top: var(--closePadding, 12px);
  }

  button.dismiss {
    background: none;
    padding: 0;
    border: none;
    cursor: pointer;
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
            <button class="dismiss buttonLike" on:click={dismiss}>
              <XCircle24 />
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
