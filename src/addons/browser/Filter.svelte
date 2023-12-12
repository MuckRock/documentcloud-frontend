<script lang="ts">
  export let name: string;
  export let selected: boolean;
</script>

<label class:selected class="filter">
  {#if $$slots.input}<span class="input"><slot name="input" /></span>{/if}
  {#if $$slots.icon}<span class="icon"><slot name="icon" /></span>{/if}
  <span class="name">{name}</span>
</label>

<style>
  .input {
    display: none;
  }
  .filter {
    display: flex;
    gap: 0.5em;
    padding: 0.25em 0.75em 0.25em 0.5em;
    border: 1px solid transparent;
    border-radius: calc(var(--radius, 4px) * 3);
    cursor: pointer;
    font-weight: 600;
    color: var(--darkgray);
    fill: inherit;
  }
  .filter:hover {
    border: 1px solid rgba(0, 0, 0, 0.125);
    background-color: rgba(0, 0, 0, 0.05);
  }
  .filter.selected {
    fill: var(--darkgray);
    border: 1px solid rgba(0, 0, 0, 0.125);
    background-color: var(--barFaded, #cae4ff);
  }
  .filter.selected .icon {
    fill: var(--gray) !important;
  }
  .icon {
    width: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .name {
    flex: 1 1 auto;
  }
</style>
