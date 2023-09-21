<script>
  import Draggable from "@/common/Draggable.svelte";

  export let secondary = false;
</script>

<style lang="scss">
  .dropzone {
    width: 100%;
    height: 108px;
    display: table;
    background: $primary-faded;
    user-select: none;

    > :global(*) {
      border: dashed 2px $primary;
      box-sizing: border-box;
    }

    &.secondary {
      background: none;

      > :global(*) {
        border: dashed 2px $secondary;
        background: #e6e6e6;
        height: 65px;
      }
    }

    :global(.dragging) {
      background: $primary;
      border: solid 2px $primary;
      border-radius: $radius;
    }
  }

  .content {
    display: table-cell;
    vertical-align: middle;
    text-align: center;
  }

  .secondary .content {
    opacity: 0.7;
    font-size: 15px;
  }
</style>

<div class:secondary class="dropzone">
  <Draggable on:files>
    <div class="content">
      <slot />
    </div>
  </Draggable>
</div>
