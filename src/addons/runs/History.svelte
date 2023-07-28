<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../../common/Button.svelte";
  import Error from "../../common/icons/Error.svelte";
  import HistoryEvent, { type Run } from "./HistoryEvent.svelte";
  import History24 from "svelte-octicons/lib/History24.svelte";
  import Loader from "../../common/Loader.svelte";
  import Paginator from "../Paginator.svelte";
  import { baseApiUrl } from "../../api/base.js";

  let res: {
    next?: string | null;
    previous?: string | null;
    results?: Run[];
  } = {};

  let loading = false;
  let error;

  export let per_page = 10;

  const endpoint = new URL("/api/addon_runs/?expand=addon", baseApiUrl);
  const options: RequestInit = {
    credentials: "include",
  };

  export async function load(url?: string | URL) {
    try {
      if (!url) {
        url = endpoint;
      }

      if (!(url instanceof URL)) {
        url = new URL(url);
      }

      url.searchParams.set("per_page", String(per_page));

      loading = true;
      const resp = await fetch(url, options);
      if (resp.ok) {
        res = await resp.json();
      } else {
        error = resp.statusText;
      }
      loading = false;
    } catch (error) {
      error = error.message;
      loading = false;
    }
  }

  $: next_url = res.next ? new URL(res.next) : null;
  $: prev_url = res.previous ? new URL(res.previous) : null;
  $: loadNext = () => load(next_url);
  $: loadPrev = () => load(prev_url);
  $: runs = res.results ?? [];
  $: empty = !loading && !error && runs.length === 0;

  onMount(load);
</script>

<style>
  .history-list ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
    overflow: hidden;
  }
  .history-list li {
    padding: 0.5em 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    &:last-child {
      border-bottom: none;
    }
  }
  .empty,
  .loading,
  .error {
    margin: 2em 1em;
    color: var(--darkgray);
    fill: var(--gray);
  }
  .error {
    color: var(--caution);
  }
  .empty .icon {
    transform: scale(2);
    opacity: 0.4;
  }
  .error .icon {
    height: 3em;
    width: 3em;
  }
  .empty,
  .error,
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .pagination-controls {
    position: sticky;
    bottom: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding: 0.5em 1em;
    background: var(--menubg, white);
  }
</style>

<div class="history-list">
  {#if empty}
    <div class="empty">
      <div class="icon"><History24 /></div>
      <p>{$_("addonRuns.history.empty")}</p>
    </div>
  {:else if loading}
    <div class="loading">
      <Loader active center big pad />
      <p>{$_("addonRuns.history.loading")}</p>
    </div>
  {:else if error}
    <div class="error">
      <div class="icon"><Error /></div>
      <p>{error}</p>
      <Button action on:click={() => load()}
        >{$_("addonRuns.history.retry")}</Button
      >
    </div>
  {:else}
    <ul>
      {#each runs as run}
        <li><HistoryEvent {run} /></li>
      {/each}
    </ul>
  {/if}
  {#if prev_url || next_url}
    <div class="pagination-controls">
      <Paginator
        has_next={Boolean(next_url)}
        has_previous={Boolean(prev_url)}
        on:next={loadNext}
        on:previous={loadPrev}
      />
    </div>
  {/if}
</div>
