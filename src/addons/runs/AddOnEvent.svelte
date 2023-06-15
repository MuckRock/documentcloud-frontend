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
  export let event: Event;

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
