<script lang="ts" context="module">
  import type { AddOnListItem } from "./AddOnListItem.svelte";

  export interface AddOnList {
    items?: AddOnListItem[];
    loading: boolean;
    error?: string | null;
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import Loader from "../../common/Loader.svelte";
  import Error from "../../common/icons/Error.svelte";
  import ListItem from "./AddOnListItem.svelte";
  import EmptyResults from "../../common/icons/EmptyResults.svelte";
  import Button from "../../common/Button.svelte";

  export let items: AddOnListItem[];
  export let loading: boolean;
  export let error: string | undefined;
  export let reload: () => void | undefined;
  $: empty = !(items && items.length > 0);
</script>

<style>
  .list {
    background-color: white;
    min-width: 24em;
    min-height: 100%;
  }

  .list,
  .empty,
  .error {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .empty,
  .loading {
    position: relative;
    color: var(--gray);
  }

  .error {
    color: var(--caution);
  }

  .empty .icon,
  .error .icon {
    width: 3em;
    height: auto;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
</style>

<div class="list">
  {#if !empty}
    <ul>
      {#each items as addOn (addOn.id)}
        <li><ListItem {...addOn} /></li>
      {/each}
    </ul>
  {:else if loading}
    <!-- Loading state -->
    <div class="loading">
      <Loader active center big pad />
      <p class="loading">{$_("addonBrowserDialog.loading")}</p>
    </div>
  {:else if error}
    <!-- Error state -->
    <div class="error">
      <div class="icon"><Error /></div>
      <p>{error}</p>
      {#if reload}<Button action on:click={reload}>{$_("addonBrowserDialog.retry")}</Button>{/if}
    </div>
  {:else}
    <!-- Empty state -->
    <div class="empty">
      <div class="icon"><EmptyResults /></div>
      <p class="empty">{$_("addonBrowserDialog.empty")}</p>
    </div>
  {/if}
</div>
