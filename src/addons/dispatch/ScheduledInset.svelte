<script lang="ts">
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";

  import type { AddOnListItem } from "../types.ts";
  import ScheduledEvent, { type Event } from "../runs/ScheduledEvent.svelte";

  import { baseApiUrl } from "../../api/base.js";

  export let addon: AddOnListItem;
  export let events: Event[] = [];
  export let open: boolean = false;

  let error: Error;
  let next: string;

  export async function load() {
    if (!addon) return;

    const endpoint = new URL(
      `/api/addon_events/?expand=addon&addon=${addon.id}`,
      baseApiUrl,
    );

    const options: RequestInit = {
      credentials: "include",
    };

    const resp = await fetch(endpoint, options).catch((e) => {
      return {
        ok: false,
        statusText: e.message,
        json() {},
      };
    });

    if (!resp.ok) {
      error = new Error(resp.statusText);
      return;
    }

    const { results, next_url } = await resp.json();

    events = results;
    next = next_url;
  }

  onMount(async () => {
    if (events.length === 0) {
      await load();
    }
  });
</script>

<style>
  .scheduled-list {
    width: 100%;
  }

  summary {
    cursor: pointer;
  }

  .scheduled-list ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  .scheduled-list li {
    padding: 0;
  }
</style>

{#if events.length > 0}
  <details class="scheduled-list" bind:open>
    <summary>
      {$_("addonDispatchDialog.showAddons", {
        values: { n: events.length },
      })}
    </summary>

    <ul>
      {#each events as event}
        <li><ScheduledEvent {event} /></li>
      {/each}
    </ul>
  </details>
{/if}
