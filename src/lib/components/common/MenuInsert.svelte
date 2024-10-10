<div class="menuInsert">
  <slot />
</div>

<style>
  .menuInsert {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 0.5rem;
    padding: 1rem;
    gap: 0.5rem;
    border: 1px solid var(--gray-2);
    border-radius: var(--radius, 3px);
  }
</style>
