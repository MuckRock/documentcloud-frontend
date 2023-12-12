<script>
  import { createEventDispatcher } from "svelte";
  import { Check16, Dash16 } from "svelte-octicons";

  const dispatch = createEventDispatcher();

  export let checked = false;
  export let indeterminate = false;
  export let disabled = false;
  let checkbox;

  function handleChange() {
    if (checked) {
      dispatch("check", { indeterminate });
    } else {
      dispatch("uncheck");
    }
  }
</script>

<label>
  <input
    type="checkbox"
    bind:this={checkbox}
    bind:checked
    {disabled}
    on:change={handleChange}
  />
  <span>
    {#if checked}
      {#if indeterminate}
        <Dash16 />
      {:else}
        <Check16 />
      {/if}
    {/if}
  </span>
</label>

<style>
  label {
    display: inline-block;
    height: var(--checkboxSize, 22px);
    width: var(--checkboxSize, 22px);
  }

  input {
    opacity: 0;
    position: fixed;
    z-index: var(--checkboxZ, -9);
  }

  span {
    border: solid 1px #bbbbbb;
    border-radius: 2px;
    cursor: pointer;
    display: inline-block;
    height: var(--checkboxSize, 22px);
    position: relative;
    transition:
      box-shadow 0.2s ease,
      border 0.2s ease;
    user-select: none;
    width: var(--checkboxSize, 22px);
  }

  span:hover {
    border: solid 1px var(--primary, #4294f0);
  }

  /* make the svg the same size as its container */
  span :global(svg) {
    fill: white;
    height: var(--checkboxSize, 22px);
    width: var(--checkboxSize, 22px);
  }

  input:focus + span {
    border: solid 1px var(--primary, #4294f0);
  }

  input:checked + span {
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
    border: solid 1px #bbbbbb;
  }

  input:checked:disabled + span {
    background: rgba(0, 0, 0, 0.05);
    border: solid 1px #bbbbbb;
  }

  input:checked:disabled + span:hover {
    border: solid 1px #bbbbbb;
  }
</style>
