<script lang="ts" context="module">
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
  import type { Event } from "@/addons/types";

  import { _ } from "svelte-i18n";
  import { Pencil16 } from "svelte-octicons";

  import Action from "../common/Action.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  export let event: Event;

  $: disabled = event.event === 0;
  $: key = event.addon?.parameters?.eventOptions?.name;
  $: target = event.parameters[key];

  function url(event: Event) {
    return `/add-ons/${event.addon.repository}/${event.id}/`;
  }
</script>

<SidebarItem href={url(event)}>
  <div class="info" class:disabled>
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
  <Action icon={Pencil16}>{$_("dialog.edit")}</Action>
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
  .routine {
    color: var(--gray-5);
    font-style: italic;
  }
  .target {
    color: var(--gray-5);
  }
</style>
