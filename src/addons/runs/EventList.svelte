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
  import { baseApiUrl } from "../../api/base.js";

  export let events: Event[] = [];
  export let per_page = 5;

  const schedules = ["Disabled", "hourly", "daily", "weekly", "on upload"];
  const endpoint = new URL("/api/addon_events/", baseApiUrl);
  const options: RequestInit = {
    credentials: "include",
  };

  let next_url: URL | null;
  let previous_url: URL | null;

  export async function load(url?: string | URL) {
    if (!url) {
      url = endpoint;
    }

    if (!(url instanceof URL)) {
      url = new URL(url);
    }

    url.searchParams.set("per_page", String(per_page));
    const resp = await fetch(url, options);

    if (resp.ok) {
      const { next, previous, results } = await resp.json();

      next_url = next ? new URL(next) : null;
      previous_url = previous ? new URL(previous) : null;
      events = results;
    }
  }

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
