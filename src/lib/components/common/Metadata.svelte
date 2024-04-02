<script lang="ts">
  export let key: string;
  export let value: string;
</script>

<div class="metadata">
  <slot name="icon" />
  <dl class="text">
    <dt>{key}</dt>
    <dd>{value}</dd>
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
    align-items: flex-start;
  }
</style>
