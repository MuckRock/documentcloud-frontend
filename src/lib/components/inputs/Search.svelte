<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { _ } from "svelte-i18n";
  import { Search16, XCircleFill24 } from "svelte-octicons";

  export let id: string = "";
  export let value: string = "";
  export let name: string = "q";
  export let placeholder: string = $_("common.search");

  let dispatch = createEventDispatcher();
  let input: HTMLInputElement;

  function reset() {
    value = "";
    input.focus();
    dispatch("reset");
  }
</script>

<label for={id} title={$_("common.search")}>
  <Search16 />
  <span class="sr-only">{$_("common.search")}</span>
  <input
    {id}
    {name}
    {placeholder}
    type="search"
    autocomplete="off"
    spellcheck="false"
    bind:value
    bind:this={input}
    on:change
    on:input
  />
  <button
    title={$_("search.reset")}
    type="reset"
    class:hidden={!value}
    on:click={reset}
  >
    <XCircleFill24 />
  </button>
</label>

<style>
  input {
    flex: 1 0 0;
    appearance: none;
    padding: 0.25rem;
    border: none;
    background: var(--white);
    font-family: var(--font-sans, "Source Sans Pro");
    font-weight: var(--font-regular, 400);
    font-size: var(--font-md, 1rem);
    box-shadow: none;
  }

  input:focus {
    outline: none;
  }

  input::placeholder {
    color: var(--gray-4, #5c717c);
  }

  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }

  label {
    display: flex;
    align-items: center;
    width: 100%;

    border: 1px solid var(--gray-2);
    border-radius: 0.5rem;
    padding: 0 0.5rem;

    overflow: hidden;
  }

  label:focus-within {
    outline: inherit;
    border-color: var(--blue-3);
    box-shadow: 0 0 0 1px var(--blue-3);
  }

  button {
    flex: 0 0 0;
    appearance: none;
    border: none;
    display: flex;
    align-items: center;
    padding: 0;
    font-family: var(--font-sans, "Source Sans Pro");
    font-weight: var(--font-regular, 400);
    font-size: var(--font-md, 1rem);
    background: transparent;
    fill: var(--gray-3, #99a8b3);
    cursor: pointer;
    opacity: 1;
    visibility: visible;
    transform: translateX(0) rotate(0deg);
    transition:
      transform 0.25s ease-in-out,
      opacity 0.125s linear,
      visibility 0s;
  }

  button.hidden {
    visibility: hidden;
    opacity: 0;
    transform: translateX(100%) rotate(90deg);
    transition:
      transform 0.25s ease-in-out,
      opacity 0.125s linear,
      visibility 0s linear 0.25s,
      position 0s linear 0.25s;
  }
</style>
