<script lang="ts">
  import type { Maybe, Nullable, Page } from "$lib/api/types";
  import type { Event } from "@/addons/types";

  import { _ } from "svelte-i18n";
  import { Clock16, Hourglass24 } from "svelte-octicons";

  import ScheduledEvent from "./ScheduledEvent.svelte";
  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";
  import Paginator from "$lib/components/common/Paginator.svelte";
  import Empty from "../common/Empty.svelte";

  export let events: Event[];
  export let previous: Maybe<Nullable<string>> = undefined;
  export let next: Maybe<Nullable<string>> = undefined;

  export let loading = false;

  // load the next set of results
  async function load(url: URL) {
    loading = true;

    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      // todo: better error handling
      console.error(res.statusText);
      loading = false;
    }

    const results: Page<Event> = await res.json();

    events = results.results;
    next = results.next;
    previous = results.previous;
    loading = false;
  }
</script>

<SidebarGroup>
  <SidebarItem slot="title">
    <Clock16 slot="start" />
    {$_("addonRuns.scheduled")}
  </SidebarItem>

  {#if loading}
    <Empty icon={Hourglass24}>{$_("addonRuns.upcoming.loading")}</Empty>
  {:else}
    {#each events as event}
      <ScheduledEvent {event} />
    {:else}
      <Empty>
        {$_("addonRuns.upcoming.empty")}
      </Empty>
    {/each}
  {/if}

  {#if previous || next}
    <Paginator
      has_next={Boolean(next)}
      has_previous={Boolean(previous)}
      on:next={(e) => {
        if (next) {
          load(new URL(next));
        }
      }}
      on:previous={(e) => {
        if (previous) {
          load(new URL(previous));
        }
      }}
    />
  {/if}
</SidebarGroup>
