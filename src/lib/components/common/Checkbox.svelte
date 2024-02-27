<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Check16, Dash16 } from "svelte-octicons";

  const dispatch = createEventDispatcher();

  export let disabled = false;
  export let status: "off" | "on" | "some" = "off";

  let checkbox: HTMLInputElement;

  $: checked = status === "on" || status === "some";

  function handleChange() {
    if (checked) {
      dispatch("check", { status });
    } else {
      dispatch("uncheck", { status });
    }
  }
</script>

<label>
  <input
    type="checkbox"
    bind:this={checkbox}
    {disabled}
    {checked}
    on:input={handleChange}
  />
  <span>
    {#if status === "on"}
      <Check16 />
    {:else if status === "some"}
      <Dash16 />
    {/if}
  </span>
</label>

<style>
  label {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
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
