<script lang="ts">
  import type { Page } from "@/api/types/common";
  import type { Run } from "@/addons/types";

  import { _ } from "svelte-i18n";
  import { History16 } from "svelte-octicons";

  import HistoryEvent from "./HistoryEvent.svelte";
  import Paginator from "@/common/Paginator.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  export let runs: Run[];
  export let previous: string = undefined;
  export let next: string = undefined;

  let loading = false;

  // load the next set of results
  async function load(url: URL) {
    loading = true;

    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      // todo: better error handling
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
    <History16 />
    {$_("addonRuns.previous")}
  </SidebarItem>

  {#each runs as run}
    <HistoryEvent {run} />
  {/each}

  {#if previous || next}
    <Paginator
      has_next={Boolean(next)}
      has_previous={Boolean(previous)}
      on:next={(e) => {
        load(new URL(next));
      }}
      on:previous={(e) => {
        load(new URL(previous));
      }}
    />
  {/if}
</SidebarGroup>
