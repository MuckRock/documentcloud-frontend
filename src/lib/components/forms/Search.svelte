<script lang="ts">
  import { createBubbler } from "svelte/legacy";

  const bubble = createBubbler();
  import type { Snippet } from "svelte";
  import type { Maybe } from "$lib/api/types";

  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { _ } from "svelte-i18n";
  import { Search16, XCircleFill24 } from "svelte-octicons";

  interface Props {
    name?: string;
    query?: string;
    placeholder?: string;
    action?: Maybe<string>;
    id?: string;
    otherParams?: any;
    help?: Snippet;
    onchange?: (event: Event) => void;
    onsubmit?: (event: SubmitEvent) => void;
  }

  let {
    name = "q",
    query = $bindable(""),
    placeholder = $_("common.search"),
    action = undefined,
    id = "query",
    otherParams = {},
    help,
  }: Props = $props();

  let input: HTMLInputElement | undefined = $state();
  let form: HTMLFormElement | undefined = $state();

  function clear(): Promise<void> {
    query = "";
    input?.focus();

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
      url.searchParams.set(name, query);
    } else {
      url.searchParams.delete(name);
    }

    for (const [key, value] of Object.entries(otherParams)) {
      url.searchParams.set(key, String(value));
    }

    return goto(url);
  }
</script>

<form
  class="container"
  {action}
  onsubmit={submit}
  onreset={clear}
  bind:this={form}
>
  <!-- <Search {name} {placeholder} bind:value={query} on:reset={clear} /> -->
  <label for={id} title={$_("common.search")}>
    <Search16 />
    <span class="sr-only">{$_("common.search")}</span>
    <input
      type="search"
      {id}
      autocomplete="off"
      spellcheck="false"
      {name}
      {placeholder}
      bind:value={query}
      bind:this={input}
      onchange={bubble("change")}
      oninput={bubble("input")}
    />
    <button
      title={$_("search.reset")}
      type="reset"
      class:hidden={!query}
      onclick={clear}
    >
      <XCircleFill24 />
    </button>
  </label>
  {#if help}<div class="help">{@render help?.()}</div>{/if}
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
