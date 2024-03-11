<script lang="ts">
  import { Pencil16 } from "svelte-octicons";

  export let title: string;
  export let small: boolean = false;
</script>

<button
  {title}
  class="edit"
  class:small
  on:click|stopPropagation|preventDefault
>
  <Pencil16 />
</button>

<style>
  .edit {
    flex: 0 0 2rem;
    padding: 0.25rem;
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    appearance: none;
    fill: var(--primary);
    background: transparent;
    border: none;
    border-radius: 1rem;
    cursor: pointer;
  }

  .edit.small {
    height: 1.25rem;
    width: 1.25rem;
  }

  .edit:hover {
    fill: var(--white);
    background: var(--primary);
  }
</style>
