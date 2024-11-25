<script lang="ts">
  import type { Maybe, Nullable, Page, Event } from "$lib/api/types";

  import { _ } from "svelte-i18n";
  import { Alert24, Clock16, Hourglass24 } from "svelte-octicons";

  import ScheduledEvent from "./ScheduledEvent.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import Empty from "../common/Empty.svelte";

  import { getApiResponse } from "$lib/utils/api";

  export let events: Event[];
  export let previous: Maybe<Nullable<string>> = undefined;
  export let next: Maybe<Nullable<string>> = undefined;

  export let loading = false;

  let error: string = "";

  // load the next set of results
  async function load(url: URL) {
    loading = true;

    const resp = await fetch(url, { credentials: "include" }).catch(
      console.error,
    );

    const { data: results, error: err } =
      await getApiResponse<Page<Event>>(resp);

    if (err) {
      error = err.message;
    }

    if (results) {
      events = results.results;
      next = results.next;
      previous = results.previous;
    }

    loading = false;
  }
</script>

<SidebarGroup>
  <SidebarItem slot="title">
    <Clock16 slot="start" />
    {$_("addonRuns.scheduled")}
  </SidebarItem>

  {#if loading}
    <Empty icon={Hourglass24}>{$_("common.loading")}</Empty>
  {:else if error}
    <Empty icon={Alert24}>
      {error}
    </Empty>
  {:else}
    {#each events as event}
      <ScheduledEvent {event} />
    {:else}
      <Empty>
        {$_("common.empty")}
      </Empty>
    {/each}
  {/if}

  {#if previous || next}
    <Paginator
      has_next={Boolean(next)}
      has_previous={Boolean(previous)}
      on:next={() => {
        if (next) {
          load(new URL(next));
        }
      }}
      on:previous={() => {
        if (previous) {
          load(new URL(previous));
        }
      }}
    />
  {/if}
</SidebarGroup>
