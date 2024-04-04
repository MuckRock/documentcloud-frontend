<div class="menu">
  <slot>Define some menu items</slot>
</div>

<style>
  .menu {
    display: flex;
    flex-direction: column;
    margin-top: 0.25rem;
    background: var(--white, #ffffff);
    border-radius: 0.5rem;
    border: 1px solid var(--gray-1);
    box-shadow: var(--shadow);
    padding: 0.5rem;
    gap: 0.25rem;
  }
  :global(.menu.small) {
    color: var(--gray-3);
    font-size: 11px;
    text-transform: uppercase;
    margin: 3px 0 0 0;
  }
</style>
