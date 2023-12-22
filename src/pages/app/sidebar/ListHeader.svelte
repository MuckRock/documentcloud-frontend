<h3 class="listHeader">
  {#if $$slots.expanded}
    <div class="expanded">
      <slot name="expanded" />
    </div>
  {/if}
  <span class="label">
    <slot />
  </span>
  {#if $$slots.action}<div class="action"><slot name="action" /></div>{/if}
</h3>

<style>
  .listHeader {
    display: flex;
    align-items: center;
    margin: 0 1.5rem 0.5rem 0.5rem;
    border-radius: var(--radius);
    overflow: hidden;
  }

  .label {
    flex: 1 1 auto;
  }

  .action,
  .expanded {
    flex: 0 0 auto;
  }

  .expanded {
    margin-right: 0.5rem;
  }
</style>
