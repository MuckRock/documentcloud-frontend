<script lang="ts">
  export let key: string;
</script>

<div class="metadata">
  <slot name="icon" />
  <dl class="text">
    <dt>{key}</dt>
    <dd><slot /></dd>
  </dl>
</div>

<style>
  .metadata {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 0.125em 1rem;
  }

  dt {
    font-size: var(--font-xs);
    color: var(--gray-4);
    text-transform: lowercase;
    white-space: nowrap;
  }
  dd {
    font-size: var(--font-sm);
  }
</style>
