<script context="module" lang="ts">
  // https://api.www.documentcloud.org/api/addon_events/?expand=addon
  /*
  {
    "id": 533,
    "addon": 436,
    "user": 1020,
    "parameters": {
        "site": "https://github.com/muckrock/klaxon",
        "selector": "readme-toc"
    },
    "event": 3,
    "scratch": {
        "timestamp": "20230521013040"
    },
    "created_at": "2023-04-19T18:20:39.025963Z",
    "updated_at": "2023-05-21T01:30:50.312638Z"
  }
  */

  import type { AddOnListItem } from "./AddOnListItem.svelte";

  export interface AddOnEvent {
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
  export let event: AddOnEvent;

  const schedules = ["Disabled", "hourly", "daily", "weekly", "on upload"];

  $: url = `#add-ons/${event.addon.repository}/${event.id}`;
</script>

<style></style>

<div class="addon-event" id="event-{event.id}">
  <h3>{event.addon.name}</h3>
  <p class="info">
    {#if event.event === 0}
      {schedules[event.event]}
    {:else}
      Runs {schedules[event.event]}
    {/if}
  </p>

  <a href={url}>Edit</a>
</div>
