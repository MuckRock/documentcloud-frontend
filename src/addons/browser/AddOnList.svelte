<script lang="ts" context="module">
  import Loader from "../../common/Loader.svelte";
  import type { AddOnListItem } from "./AddOnListItem.svelte";

  export interface AddOnList {
    items?: AddOnListItem[];
    loading: boolean;
    error?: string | null;
  }
</script>

<script lang="ts">
  import Error from "../../common/icons/Error.svelte";
  import ListItem from "./AddOnListItem.svelte";
  import EmptyResults from "../../common/icons/EmptyResults.svelte";

  export let items: AddOnListItem[] = [];
  export let loading: boolean = false;
  export let error: string | null = null;
  const empty = !(items && items.length > 0);
</script>

<style>
  .list {
    background-color: white;
    padding: 0.5em 0;
    min-width: 24em;
    min-height: 12em;
  }

  .list,
  .empty,
  .error {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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

  li {
    margin: 1.5rem;
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
      <p class="loading">Loading…</p>
    </div>
  {:else if error}
    <!-- Error state -->
    <div class="error">
      <div class="icon"><Error /></div>
      <p>{error}</p>
    </div>
  {:else}
    <!-- Empty state -->
    <div class="empty">
      <div class="icon"><EmptyResults /></div>
      <p class="empty">No add-ons found</p>
    </div>
  {/if}
</div>
