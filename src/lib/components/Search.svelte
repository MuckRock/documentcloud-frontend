<script lang="ts">
  import { Search24, XCircleFill24 } from "svelte-octicons";

  export let query: string = "";
  let input: HTMLInputElement;

  function clear() {
    query = "";
    input.focus();
  }
</script>

<form class="container" on:submit>
  <label for="query" title="Search"><Search24 /></label>
  <input
    type="search"
    id="query"
    name="q"
    autocomplete="off"
    placeholder="Search…"
    bind:value={query}
    bind:this={input}
    on:change
    on:input
    on:reset
  />
  <button
    title="Clear Search"
    type="reset"
    class:hidden={!query}
    on:click={clear}
  >
    <XCircleFill24 />
  </button>
</form>

<style>
  form {
    display: flex;
    align-items: center;
    align-self: stretch;
    gap: 0.75rem;

    color: var(--gray-5, #233944);
    fill: var(--gray-5, #233944);
  }
  input {
    flex: 1 0 0;
    appearance: none;
    padding: 0.25rem;
    border: none;
    font-family: var(--font-sans, "Source Sans Pro");
    font-weight: var(--font-regular, 400);
    font-size: var(--font-m, 1rem);
  }
  input::placeholder {
    color: var(--gray-4, #5c717c);
  }
  label {
    display: flex;
    align-items: center;
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
    font-size: var(--font-m, 1rem);
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
      visibility 0s linear 0.25s;
  }
</style>
