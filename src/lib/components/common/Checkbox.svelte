<script lang="ts">
  import { Check16, Dash16 } from "svelte-octicons";

  export let disabled = false;
  export let checked = false;
  export let indeterminate = false;

  export let label = "";

  let checkbox: HTMLInputElement;
</script>

<label>
  <input
    type="checkbox"
    bind:this={checkbox}
    {disabled}
    bind:checked
    bind:indeterminate
    on:input
    on:change
  />
  <span>
    {#if checked}
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
    gap: 0.625rem;
    align-self: stretch;
  }

  input {
    opacity: 0;
    position: fixed;
    z-index: -10;
  }

  span {
    border: solid 1px var(--gray-3, #bbbbbb);
    border-radius: 2px;
    cursor: pointer;
    display: inline-block;
    height: 1.25rem;
    flex-shrink: 0;
    transition:
      box-shadow 0.2s ease,
      border 0.2s ease;
    user-select: none;
    width: 1.25em;
    box-sizing: border-box;
  }

  span:hover {
    border: solid 1px var(--primary, #4294f0);
  }

  /* make the svg the same size as its container */
  span :global(svg) {
    fill: white;
    width: 1.25rem;
    height: 1.25rem;
  }

  input:focus + span {
    border: solid 1px var(--primary, #4294f0);
  }

  input:checked + span,
  input:indeterminate + span {
    background: var(--primary, #4294f0);
    border: solid 1px var(--primary, #4294f0);
  }

  input:checked:focus + span {
    box-shadow: 0 0 0 2px var(--primary-faded, rgba(66, 148, 240, 0.13));
    border: solid 1px var(--primary, #4294f0);
  }

  input:disabled + span {
    background: rgba(0, 0, 0, 0.05);
    cursor: default;
  }

  input:disabled + span:hover {
    border: solid 1px var(--gray-3, #bbbbbb);
  }

  input:checked:disabled + span {
    background: rgba(0, 0, 0, 0.05);
    border: solid 1px var(--gray-3, #bbbbbb);
  }

  input:checked:disabled + span:hover {
    border: solid 1px var(--gray-3, #bbbbbb);
  }
</style>
