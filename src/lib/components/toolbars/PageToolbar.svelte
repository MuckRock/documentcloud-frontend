<!--
  @component
  PageToolbar floats at the bottom of the page, holding controls like pagination.
  It's slotted for composition based on the page it's on.
-->
<script lang="ts">
  export let width: undefined | number = undefined;
</script>

<div class="toolbar" bind:clientWidth={width}>
  {#if $$slots.left}
    <div class="left">
      <slot name="left" />
    </div>
  {/if}
  {#if $$slots.center}
    <div class="center">
      <slot name="center" />
    </div>
  {/if}
  {#if $$slots.right}
    <div class="right">
      <slot name="right" />
    </div>
  {/if}
</div>

<style>
  .toolbar {
    display: inline-flex;
    min-height: 2.5rem;
    padding: 0 0.25rem;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: unset;
    background: var(--white);
  }

  .left,
  .center,
  .right {
    flex: 1 0 0;
    min-width: 0;
  }

  .left {
    text-align: left;
  }

  .center {
    text-align: center;
  }

  .right {
    text-align: right;
  }
</style>
