<script lang="ts">
  import type { Maybe, Nullable } from "$lib/api/types";

  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { Search16, XCircleFill24 } from "svelte-octicons";
  import { _ } from "svelte-i18n";

  export let name: string = "q";
  export let query: string = "";
  export let placeholder: string = $_("common.search");
  export let action: Maybe<string> = undefined;

  let input: HTMLInputElement;
  let form: HTMLFormElement;

  function clear(): Promise<void> {
    query = "";
    input.focus();

    const url = new URL($page.url);
    url.searchParams.delete(name);
    return goto(url);
  }

  function search(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const q = fd.get(name) as string;
    const url = new URL($page.url);

    if (q) {
      url.searchParams.set(name, q);
    } else {
      url.searchParams.delete(name);
    }

    return goto(url);
  }
</script>

<form
  class="container"
  {action}
  on:submit={search}
  on:reset={clear}
  bind:this={form}
>
  <label for="query" title="Search">
    <Search16 />
    <span class="sr-only">{$_("common.search")}</span>
  </label>
  <input
    type="search"
    id="query"
    autocomplete="off"
    {name}
    {placeholder}
    bind:value={query}
    bind:this={input}
    on:change
    on:input
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
    align-self: stretch;
    gap: 0.25rem;
    padding: 0 0.5rem;

    color: var(--gray-5, #233944);
    fill: var(--gray-5, #233944);
    border: 1px solid var(--gray-2);
    border-radius: 0.5rem;

    overflow: hidden;
  }
  form:focus-within {
    outline: inherit;
    border-color: var(--blue-3);
    box-shadow: 0 0 0 1px var(--blue-3);
  }
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
