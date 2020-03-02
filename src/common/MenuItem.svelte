<script>
  export let danger = false;
  export let selectable = true;
  export let primary = false;
  export let disabled = false;
</script>

<style lang="scss">
  .item {
    padding: 6px 21px;
    font-size: 16px;
    user-select: none;

    &.danger {
      color: $caution;
    }

    &.disabled {
      color: $gray;
      pointer-events: none;
    }

    &.primary {
      color: $primary;
    }

    &.selectable {
      cursor: pointer;

      &:hover {
        background: $primary;
        color: white;

        :global(.info),
        :global(.scope) {
          color: white;
        }
      }
    }

    :global(.info) {
      font-size: 13px;
      color: $gray;
    }
  }
</style>

<div
  class="item"
  class:selectable
  class:danger
  class:primary
  class:disabled
  on:click>
  <slot>Define an item</slot>
</div>
