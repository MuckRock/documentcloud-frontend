<script lang="ts" context="module">
  import type { AddOnListItem } from "./AddOnListItem.svelte";

  export interface AddOnList {
    items?: AddOnListItem[];
    loading: boolean;
    error?: string | null;
  }
</script>

<script lang="ts">
  import ListItem from "./AddOnListItem.svelte";

  export let items: AddOnListItem[] = [];
  export let loading: boolean = false;
  export let error: string | null = null;
</script>

<style>
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
  {#if items && items.length > 0}
    <ul>
      {#each items as addOn (addOn.id)}
        <li><ListItem {...addOn} /></li>
      {/each}
    </ul>
  {:else if loading}
    <!-- Loading state -->
    <p class="loading">Loading…</p>
  {:else if error}
    <!-- Error state -->
    <p class="error">{error}</p>
  {:else}
    <!-- Empty state -->
    <p class="empty">No results</p>
  {/if}
</div>
