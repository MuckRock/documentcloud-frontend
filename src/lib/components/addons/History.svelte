<script lang="ts">
  import type { Maybe, Nullable, Page, Run } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Alert24, History16, History24, Hourglass24 } from "svelte-octicons";

  import HistoryEvent from "./HistoryEvent.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import Empty from "../common/Empty.svelte";

  import { getRunningAddons } from "$lib/components/processing/ProcessContext.svelte";
  import { getApiResponse } from "$lib/utils/api";

  export let runs: Run[];
  export let previous: Maybe<Nullable<string>> = undefined;
  export let next: Maybe<Nullable<string>> = undefined;

  export let loading = false;

  const addons = getRunningAddons();
  let error: string = "";

  $: empty = runs.length === 0;
  $: running = $addons?.reduce(
    (m, run) => {
      m[run.uuid] = run;
      return m;
    },
    {} as Record<string, Run>,
  );

  $: if ($addons?.length && running) {
    runs = runs.map((r) => running[r.uuid] || r);
  }

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
  {#snippet title()}
    <NavItem>
      <History16 slot="start" />
      {$_("addonRuns.previous")}
    </NavItem>
  {/snippet}

  {#if loading}
    <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
  {:else if error}
    <Empty icon={Alert24}>
      {error}
    </Empty>
  {:else}
    {#each runs as run}
      <HistoryEvent {run} />
    {:else}
      <Empty icon={History24}>{$_("addonDispatchDialog.noHistory")}</Empty>
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
