<script lang="ts">
  import { Check16, Dash16 } from "svelte-octicons";

  export let name: string = undefined;
  export let disabled = false;
  export let value = false;
  export let indeterminate = false;

  export let label = "";

  let checkbox: HTMLInputElement;
</script>

<label>
  <input
    type="checkbox"
    {name}
    bind:this={checkbox}
    {disabled}
    bind:checked={value}
    bind:indeterminate
    on:input
    on:change
  />
  <span>
    {#if value}
      <Check16 />
    {:else if indeterminate}
      <Dash16 />
    {/if}
  </span>
  {label}
</label>

<style>
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  input {
    display: none;
    visibility: hidden;
  }

  span {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 1.25rem;
    border: solid 1px var(--gray-4, #5c717c);
    border-radius: 0.25rem;
    cursor: pointer;
    flex-shrink: 0;
    transition:
      box-shadow 0.2s ease,
      border 0.2s ease;
    user-select: none;
    width: 1.25em;
    box-sizing: border-box;
    background: var(--white, #ffffff);
    fill: var(--white, #ffffff);
  }

  span:hover {
    border: solid 1px var(--primary, #4294f0);
  }

  input:focus + span {
    border: solid 1px var(--primary, #4294f0);
  }

  input:checked + span,
  input:indeterminate + span {
    background: var(--blue-3, #4294f0);
    border: solid 1px var(--blue-4, #1367d0);
  }

  input:checked:focus + span {
    box-shadow: 0 0 0 2px var(--blue-2, #b5ceed);
    border: solid 1px var(--blue-4, #1367d0);
  }

  input:disabled + span {
    background: var(--gray-3, #99a8b3);
    cursor: default;
  }

  input:disabled + span:hover {
    border: solid 1px var(--gray-4, #5c717c);
  }

  input:checked:disabled + span {
    background: var(--gray-3, #99a8b3);
    border: solid 1px var(--gray-4, #5c717c);
  }

  input:checked:disabled + span:hover {
    border: solid 1px var(--gray-4, #5c717c);
  }
</style>
