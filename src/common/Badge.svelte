<script lang="ts">
  export let badgeColor = "var(--light-gray)";
  export let labelColor = "var(--darkgray)";
  export let label: string;
  export let small = false;
</script>

<div
  class="badge"
  class:small
  style="--badge-color: {badgeColor}; --label-color: {labelColor};"
>
  {#if $$slots.icon}<span class="icon"><slot name="icon" /></span>{/if}
  <span class="label">{label}</span>
</div>

<style>
  .badge {
    display: inline-flex;
    padding: 0.25rem 0.5rem;
    align-items: center;
    gap: 0.25rem;
    font-weight: 600;
    border-radius: 0.375rem;
    background: var(--badge-color, var(--light-gray));
    color: var(--label-color, var(--darkgray));
    fill: var(--label-color, var(--darkgray));
  }
  .small {
    font-size: 0.875em;
  }
  .icon {
    flex: 0 0 auto;
  }
  .label {
    flex: 1 1 auto;
    opacity: 0.9;
  }
</style>
