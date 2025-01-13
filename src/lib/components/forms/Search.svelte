<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";
  import Search from "../inputs/Search.svelte";

  export let name: string = "q";
  export let query: string = "";
  export let placeholder: string = $_("common.search");
  export let otherParams = {};

  export let formatSearchString: (query: string) => string = (query) => query;

  function clear(): Promise<void> {
    const url = new URL($page.url);
    url.searchParams.delete(name);
    return goto(url);
  }

  function submit(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const q = fd.get(name) as string;
    const url = new URL($page.url);

    if (q) {
      url.searchParams.set(name, formatSearchString(q));
    } else {
      url.searchParams.delete(name);
    }

    for (const [key, value] of Object.entries(otherParams)) {
      url.searchParams.set(key, String(value));
    }

    return goto(url);
  }
</script>

<form class="container" on:submit={submit} on:reset={clear}>
  <Search {name} {placeholder} bind:value={query} on:reset={clear} />
  {#if $$slots.help}<div class="help"><slot name="help" /></div>{/if}
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    align-items: baseline;
    gap: 0.25rem;
    margin: 0.25rem;

    color: var(--gray-5, #233944);
    fill: var(--gray-5, #233944);
  }

  .help {
    flex: 1 1 100%;
    font-size: var(--font-sm);
    color: var(--gray-4);
  }
</style>
