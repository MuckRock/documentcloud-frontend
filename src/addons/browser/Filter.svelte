<script lang="ts">
  import type { SvelteComponent } from "svelte";

  export let name: string;
  export let selected: boolean;
</script>

<style>
  .checkbox {
    display: none;
  }
  .filter {
    display: flex;
    gap: .5em;
    padding: .25em .75em .25em .5em;
    border: 1px solid transparent;
    border-radius: calc(var(--radius, 4px) * 3);
    cursor: pointer;
    font-weight: 600;
    color: var(--darkgray);
    fill: inherit;
  }
  .filter:hover {
    border: 1px solid rgba(0, 0, 0, .125);
    background-color: rgba(0, 0, 0, .125);
  }
  .filter.selected {
    fill: var(--darkgray);
    border: 1px solid rgba(0, 0, 0, .125);
    background-color: var(--highlight-orange, #ff785c);
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

<label class:selected class="filter">
  <span class="checkbox"><slot name="checkbox" /></span>
  <span class="icon"><slot name="icon" /></span>
  <span class="name">{name}</span>
</label>