<script lang="ts" context="module">
  import type { AddOnListItem } from "../types.ts";

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

  // schedules and eventValues are the inverse of each other, so store them together
  export const schedules = ["disabled", "hourly", "daily", "weekly", "upload"];
  export const eventValues = {
    disabled: 0,
    hourly: 1,
    daily: 2,
    weekly: 3,
    upload: 4,
  };
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Button from "../../common/Button.svelte";
  import { Pencil16 } from "svelte-octicons";

  export let event: Event;

  $: disabled = event.event === 0;
  $: key = event.addon.parameters?.eventOptions?.name;
  $: target = event.parameters[key];

  function url(event: Event) {
    return `#add-ons/${event.addon.repository}/${event.id}`;
  }
</script>

<style>
  .addon-event {
    display: flex;
    align-items: center;
    gap: 1em;
    margin: 0.5em 0;
    padding: 0.5em 1em;
  }
  .addon-event:hover {
    background: var(--primary-faded);
  }
  .addon-event:hover .actions {
    visibility: visible;
  }
  .disabled .info {
    opacity: 0.65;
  }
  .info {
    flex: 1 1 auto;
  }
  .info p {
    margin: 0;
  }
  .actions {
    flex: 0 1 auto;
    visibility: hidden;
  }
  .name {
    font-weight: 600;
  }
  .routine {
    color: var(--darkgray);
    font-style: italic;
  }
  .target {
    color: var(--darkgray);
  }
</style>

<a
  href={url(event)}
  title={$_("dialog.edit")}
  class="addon-event"
  id="event-{event.id}"
  class:disabled
>
  <div class="info">
    <p class="name">
      {event.addon.name}
    </p>
    {#if target}
      <p class="target">{target}</p>
    {/if}
    {#if disabled}
      <p class="routine">{schedules[event.event]}</p>
    {:else}
      <p class="routine">
        {$_("addonRuns.runsOn", {
          values: { schedule: schedules[event.event] },
        })}
      </p>
    {/if}
  </div>
  <div class="actions">
    <Button action href={url(event)}><Pencil16 /></Button>
  </div>
</a>
