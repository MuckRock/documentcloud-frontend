<!-- @component
Fetch and display status of all running add-ons.
This component should update on a timer.
-->
<script context="module" lang="ts">
  import type { Run } from "@/addons/types";
  import { writable, type Writable } from "svelte/store";

  export const running: Writable<Run[]> = writable([]);
</script>

<script lang="ts">
  import { afterUpdate, onMount, onDestroy } from "svelte";
  import { _ } from "svelte-i18n";

  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  import RunningAddOn from "./RunningAddOn.svelte";

  import { POLL_INTERVAL } from "@/config/config";
  import { history } from "$lib/api/addons";

  let loading = false;
  let timeout: string | number | NodeJS.Timeout;

  onMount(async () => {
    await load();
  });

  afterUpdate(() => {
    if ($running.length > 0) {
      timeout = setTimeout(load, POLL_INTERVAL);
    }
  });

  onDestroy(() => {
    stop();
  });

  function stop() {
    clearTimeout(timeout);
    timeout = null;
  }

  async function load() {
    const { data, error } = await history({ dismissed: false, per_page: 100 });
    if (!error) {
      $running = data.results;
    }
  }
</script>

<SidebarGroup name="processing.addons">
  <SidebarItem slot="title">
    {$_("processing.addons")}
  </SidebarItem>

  {#each $running as run}
    <RunningAddOn {run} />
  {/each}
</SidebarGroup>
