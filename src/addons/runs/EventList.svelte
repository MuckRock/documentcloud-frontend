<script context="module" lang="ts">
  // https://api.www.documentcloud.org/api/addon_events/?expand=addon
  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";

  export interface Event {
    id: number;
    addon: AddOnListItem;
    user: number;
    parameters: any;
    event: number;
    scratch: any;
    created_at: string;
    updated_at: string;
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import Paginator from "../Paginator.svelte";

  export let events: Event[] = [];
  export let per_page = 5;

  const schedules = ["Disabled", "hourly", "daily", "weekly", "on upload"];
  let next_url: string;
  let previous_url: string;

  export async function load({ per_page = 5, url = "" }) {}

  function url(event: Event) {
    return `#add-ons/${event.addon.repository}/${event.id}`;
  }
</script>

<style></style>

<div class="event-list">
  <h2>{$_("addonRuns.scheduled")}</h2>
  {#each events as event}
    <div class="addon-event" id="event-{event.id}">
      <h3>{event.addon.name}</h3>
      <p class="info">
        {#if event.event === 0}
          {schedules[event.event]}
        {:else}
          Runs {schedules[event.event]}
        {/if}
      </p>

      <a href={url(event)}>Edit</a>
    </div>
  {/each}

  {#if previous_url || next_url}
    <Paginator />
  {/if}
</div>
