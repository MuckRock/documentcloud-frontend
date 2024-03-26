<script lang="ts">
  import { onMount } from "svelte";
  import { _ } from "svelte-i18n";

  import Button from "../../common/Button.svelte";
  import Clock24 from "svelte-octicons/lib/Clock24.svelte";
  import Error from "../../common/icons/Error.svelte";
  import Loader from "../../common/Loader.svelte";
  import Paginator from "../../common/Paginator.svelte";
  import ScheduledEvent from "./ScheduledEvent.svelte";
  import type { Event } from "../types";

  import { baseApiUrl } from "../../api/base.js";

  export let per_page = 5;

  // https://api.www.documentcloud.org/api/addon_events/?expand=addon
  const endpoint = new URL("/api/addon_events/?expand=addon", baseApiUrl);
  const options: RequestInit = {
    credentials: "include",
  };
  let res: {
    next?: string | null;
    previous?: string | null;
    results?: Event[];
  } = {};
  let loading = false;
  let error: string;

  $: next_url = res.next ? new URL(res.next) : null;
  $: prev_url = res.previous ? new URL(res.previous) : null;
  $: events = res.results ?? [];
  $: empty = !loading && res.results?.length === 0;

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

  $: loadNext = () => load(next_url);
  $: loadPrev = () => load(prev_url);

  onMount(load);
</script>

<div class="scheduled-list">
  {#if empty}
    <div class="empty">
      <div class="icon"><Clock24 /></div>
      <p>{$_("addonRuns.upcoming.empty")}</p>
    </div>
  {:else if loading}
    <div class="loading">
      <Loader active center big pad />
      <p>{$_("addonRuns.upcoming.loading")}</p>
    </div>
  {:else if error}
    <div class="error">
      <div class="icon"><Error /></div>
      <p>{error}</p>
      <Button action on:click={() => load()}
        >{$_("addonRuns.upcoming.retry")}</Button
      >
    </div>
  {:else}
    <ul>
      {#each events as event}
        <li><ScheduledEvent {event} /></li>
      {/each}
    </ul>
  {/if}
  {#if prev_url || next_url}
    <Paginator
      has_next={Boolean(next_url)}
      has_previous={Boolean(prev_url)}
      on:next={loadNext}
      on:previous={loadPrev}
    />
  {/if}
</div>

<style>
  .scheduled-list ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }
  .scheduled-list li {
    padding: 0;
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
</style>
