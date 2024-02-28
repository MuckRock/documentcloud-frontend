<!--
  @component
  PageToolbar floats at the bottom of the page, holding controls like pagination.
  It's slotted for composition based on the page it's on.
-->

<div class="toolbar">
  <div class="left">
    <slot name="left" />
  </div>

  <div class="center">
    <slot name="center" />
  </div>

  <div class="right">
    <slot name="right" />
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    height: 2.5rem;
    padding: 0.625rem 1rem;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    border-radius: 0.5rem;
    border: 1px solid var(--gray-2, #d8dee2);
    background: #fff;
    box-shadow: var(--shadow);
  }
  
  .left, .center, .right {
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
