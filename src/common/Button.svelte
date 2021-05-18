<script>
  import Tooltip from "./Tooltip";

  export let small = false;
  export let secondary = false;
  export let tertiary = false;
  export let nondescript = false;
  export let action = false;
  export let caution = false;
  export let danger = false;
  export let disabled = false;
  export let plain = false;
  export let nomargin = false;

  export let disabledReason = null;
</script>

<style lang="scss">
  button {
    padding: 6px 15px;
    margin: 6px 0;
    border-radius: $radius;
    outline: none;
    border: none;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    vertical-align: middle;
    background: $primary;
    color: white;
    font-family: inherit;

    &.nomargin {
      margin: 0;
    }

    &:disabled {
      opacity: 0.7;
      background: $gray;
      cursor: initial;

      &:hover {
        opacity: 0.7;
      }
    }

    &:hover {
      opacity: $hover-opacity;
    }

    &.secondary {
      background: $secondary;
    }

    &.tertiary {
      background: $tertiary;
    }

    &.danger {
      background: $caution;
    }

    &.small {
      padding: 4px 17px;
      font-size: 12px;
    }

    &.nondescript,
    &.action {
      background: none;
      border-radius: none;
      font-size: 14px;
      padding: 0;
      font-weight: normal;
    }

    &.nondescript {
      border-bottom: dashed 1px $gray;
      color: black;
    }

    &.action {
      color: $primary;

      &.secondary {
        color: $gray;
      }

      &.small {
        font-size: 12px;
      }
    }

    &.caution {
      color: $caution;

      &.nondescript {
        border-bottom: dashed 1px rgba($caution, 0.5);
      }
    }

    &.plain {
      background: rgb(242, 242, 242);
      font-size: 12px;
      border: solid 1px gainsboro;
      padding: 2px 7px;
      color: black;
      font-weight: normal;
      margin: 0 5px;
    }
  }
</style>

<span class="inlineblock">
  <Tooltip delay={500} show={disabledReason != null} caption={disabledReason}>
    <button
      on:click
      class:secondary
      class:tertiary
      class:danger
      class:small
      class:caution
      class:nondescript
      class:action
      class:plain
      class:nomargin
      disabled={disabled || disabledReason != null}
    >
      <slot />
    </button>
  </Tooltip>
</span>
