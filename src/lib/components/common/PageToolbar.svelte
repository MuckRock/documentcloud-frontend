<!--
  @component
  PageToolbar floats at the bottom of the page, holding controls like pagination.
  It's slotted for composition based on the page it's on.
-->

<div class="toolbar">
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
    display: flex;
    height: 2.5rem;
    padding: 0.625rem 1rem;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
    background: #fff;
    box-shadow: var(--shadow-1);
  }

  .left,
  .center,
  .right {
    flex: 1 0 0;
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
