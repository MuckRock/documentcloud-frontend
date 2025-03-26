<script lang="ts" context="module">
  // schedules and eventValues are the inverse of each other, so store them together

  // TODO: i18n
  export const schedules = ["disabled", "hourly", "daily", "weekly", "upload"];
  export const scheduleLabel = [
    "Disabled",
    "Runs hourly",
    "Runs daily",
    "Runs weekly",
    "Runs on upload",
  ];
  export const eventValues = {
    disabled: 0,
    hourly: 1,
    daily: 2,
    weekly: 3,
    upload: 4,
  };
</script>

<script lang="ts">
  import type { Event } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import SidebarItem from "../sidebar/SidebarItem.svelte";

  export let event: Event;

  $: disabled = event.event === 0;
  $: key = event.addon?.parameters?.eventOptions?.name;
  $: target = key ? event.parameters[key] : undefined;

  function url(event: Event) {
    return `/add-ons/${event.addon.repository}/${event.id}/`;
  }
</script>

<SidebarItem href={url(event)} on:click>
  <div class="info" class:disabled>
    <p class="name">
      {event.addon.name}
    </p>
    {#if target}
      <p class="target">{target}</p>
    {/if}
    {#if disabled}
      <p class="routine">{scheduleLabel[event.event]}</p>
    {:else}
      <p class="routine">
        {$_("addonRuns.runsOn", {
          values: { schedule: scheduleLabel[event.event] },
        })}
      </p>
    {/if}
  </div>
</SidebarItem>

<style>
  .info.disabled {
    opacity: 0.65;
  }
  .info {
    flex: 1 1 auto;
    overflow: hidden;
  }
  .info p {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .target,
  .routine {
    color: var(--gray-5);
    font-size: var(--font-sm);
    font-weight: var(--font-regular);
  }
  p.routine {
    font-style: italic;
    margin-top: 0.25em;
  }
</style>
