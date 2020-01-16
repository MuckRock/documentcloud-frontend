<script>
  export let danger = false;
</script>

<style lang="scss">
  .item {
    padding: 6px 21px;
    cursor: pointer;
    font-size: 16px;
    user-select: none;

    &.danger {
      color: $caution;
    }

    &:hover {
      background: $primary;
      color: white;
    }
  }
</style>

<div class="item" class:danger on:click>
  <slot>Define an item</slot>
</div>
