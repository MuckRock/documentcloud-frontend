<script lang="ts">
  import type { Maybe, Nullable, Page } from "$lib/api/types";
  import type { Run } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Alert24, History16, History24, Hourglass24 } from "svelte-octicons";

  import HistoryEvent from "./HistoryEvent.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import Empty from "../common/Empty.svelte";

  import { getApiResponse } from "$lib/utils/api";

  export let runs: Run[];
  export let previous: Maybe<Nullable<string>> = undefined;
  export let next: Maybe<Nullable<string>> = undefined;

  export let loading = false;

  let error: string = "";

  $: empty = runs.length === 0;

  // load the next set of results
  async function load(url: URL) {
    loading = true;

    const resp = await fetch(url, { credentials: "include" }).catch(
      console.warn,
    );

    const { data: results, error: err } = await getApiResponse<Page<Run>>(resp);

    if (err) {
      error = err.message;
    }

    if (results) {
      runs = results.results;
      next = results.next;
      previous = results.previous;
    }

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
  {:else if error}
    <Empty icon={Alert24}>
      {error}
    </Empty>
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
      on:next={() => {
        if (next) load(new URL(next));
      }}
      on:previous={() => {
        if (previous) load(new URL(previous));
      }}
    />
  {/if}
</SidebarGroup>
