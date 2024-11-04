<script lang="ts">
  import type { Maybe, Nullable, Page } from "$lib/api/types";
  import type { Run } from "@/addons/types";

  import { _ } from "svelte-i18n";
  import { History16, History24, Hourglass24 } from "svelte-octicons";

  import HistoryEvent from "./HistoryEvent.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import Empty from "../common/Empty.svelte";

  export let runs: Run[];
  export let previous: Maybe<Nullable<string>> = undefined;
  export let next: Maybe<Nullable<string>> = undefined;

  export let loading = false;

  $: empty = runs.length === 0;

  // load the next set of results
  async function load(url: URL) {
    loading = true;

    // todo: better error handling
    const res = await fetch(url, { credentials: "include" }).catch(
      console.error,
    );
    if (!res) return console.error("API error");
    if (!res.ok) {
      console.error(res.statusText);
      loading = false;
    }

    const results: Page<Run> = await res.json();

    runs = results.results;
    next = results.next;
    previous = results.previous;
    loading = false;
  }
</script>

<SidebarGroup>
  <SidebarItem slot="title">
    <History16 slot="start" />
    {$_("addonRuns.previous")}
  </SidebarItem>

  {#if loading}
    <Empty icon={Hourglass24}>Loading past runs…</Empty>
  {:else}
    {#each runs as run}
      <HistoryEvent {run} />
    {:else}
      <Empty icon={History24}>No past runs</Empty>
    {/each}
  {/if}

  {#if !loading && !empty && (previous || next)}
    <Paginator
      has_next={Boolean(next)}
      has_previous={Boolean(previous)}
      on:next={(e) => {
        if (next) load(new URL(next));
      }}
      on:previous={(e) => {
        if (previous) load(new URL(previous));
      }}
    />
  {/if}
</SidebarGroup>
