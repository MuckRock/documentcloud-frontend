<style>
  .menuInsert {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0.5rem;
    padding: 1rem;
    gap: 0.5rem;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: var(--radius);
  }
</style>

<div class="menuInsert">
  <slot />
</div>
