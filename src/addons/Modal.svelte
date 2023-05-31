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
  .modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .modal-dialog {
    border: 1px solid var(--darkgray);
    border-radius: var(--radius, 3px);
    background-color: var(--faint-gray);
    max-width: 50vw;
    margin: 1em auto;
    padding: 0.5em;
    position: relative;
  }

  .modal-dialog.right {
    margin-right: 1em;
  }

  .modal-dialog.left {
    margin-left: 1em;
  }

  button.close {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
  }
</style>

{#if visible}
  <div class="modal" class:visible tabindex="-1" role="dialog">
    <div bind:this={dialog} class="modal-dialog {anchor}" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <slot name="close-button">
            <button
              type="button"
              class="close"
              aria-label="Close"
              on:click={close}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </slot>
          <slot name="header" />
        </div>
        <div class="modal-body">
          <slot name="content" />
        </div>
        <div class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
{/if}
