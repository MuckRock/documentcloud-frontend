<script lang="ts" context="module">
  import type { AddOnListItem } from "./AddOnListItem.svelte";

  export interface AddOnList {
    data?: AddOnListItem[];
    loading: boolean;
    error?: string | null;
  }
</script>

<script lang="ts">
  import ListItem from "./AddOnListItem.svelte";

  export let data: AddOnListItem[] = [];
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
  {#if data && data.length > 0}
    <ul>
      {#each data as addOn (addOn.id)}
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
