<script lang="ts">
  export let label: string;
</script>

<div class="list-item">
  {#if $$slots.icon}<div class="icon"><slot name="icon" /></div>{/if}
  <h4>{label}</h4>
  {#if $$slots.action}<div class="action"><slot name="action" /></div>{/if}
</div>

<style>
  .list-item {
    display: flex;
    justify-content: flex-start;
    gap: 0.5em;
    padding: 0.5em 1.5rem;
    font-size: 0.875em;
    border-radius: var(--radius);
    overflow: hidden;
  }

  .list-item:hover {
    background-color: var(--menuBg);
  }

  .action {
    flex: 0 0 auto;
  }

  h4 {
    flex: 1 1 auto;
    margin: 0;
    font-weight: 600;
  }
</style>
