<script lang="ts">
  export let anchor: string = "center";
  export let visible: boolean = false;

  let dialog: HTMLElement;

  export function open() {
    visible = true;
  }

  export function close() {
    visible = false;
  }

  export function toggle() {
    visible = !visible;
  }
</script>

<style>

  .drawer {
    position: fixed;
    top: -1px;
    bottom: 1px;
    height: calc(100% + 2px); 
    border: 1px solid #ccc;
    box-sizing: border-box;
    border-radius: calc(var(--radius, 3px) * 3);
    background-color: var(--menubg);
    box-shadow: -1px 0px 4px 2px rgba(0, 0, 0, .05);
  }

  button.close {
    top: .75em;
    position: absolute;
    border-radius: 9999px;
    border: transparent;
    background-color: rgba(0, 0, 0, 0.25);
    height: 24px;
    width: 24px;
    font-size: 1em;
    cursor: pointer;
    opacity: .7;
  }
  button.close:hover {
    opacity: 1;
  }

  .drawer.right {
    right: 0;
    border-right: none;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
  }
  
  .drawer.right button.close {
    left: -2em;
  }

  .drawer.left {
    left: 0;
    border-left: none;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }

  .drawer.left button.close {
    right: -2em;
  }


</style>

{#if visible}
  <div class="drawer {anchor}" class:visible tabindex="-1" role="dialog">
    <slot name="close-button">
      <button
        type="button"
        class="close"
        title="Close Drawer"
        aria-label="Close Drawer"
        on:click={close}
      >
        <span aria-hidden="true">&times;</span>
      </button>
    </slot>
    <div bind:this={dialog} role="document">
      <slot name="content" />
    </div>
  </div>
{/if}
