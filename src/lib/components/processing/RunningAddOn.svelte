<!-- @component
A single running add-on. 
All loading and invalidation logic lives in `AddOns.svelte`.
-->
<script lang="ts">
  import type { ComponentType } from "svelte";
  import type { Run, Status } from "@/addons/types";

  import { _ } from "svelte-i18n";
  import {
    Alert16,
    CheckCircle16,
    Hourglass16,
    XCircle16,
  } from "svelte-octicons";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  import * as addons from "$lib/api/addons";
  import { getCsrfToken } from "$lib/utils/api";

  export let run: Run;

  const icons: Record<Status, ComponentType> = {
    cancelled: XCircle16,
    failure: Alert16,
    in_progress: Hourglass16,
    queued: Hourglass16,
    success: CheckCircle16,
  };

  $: is_running = ["in_progress", "queued"].includes(run.status);

  async function dismiss() {
    const csrftoken = getCsrfToken();
    run = { ...run, dismissed: true }; // optimistic update
    const { data, error } = await addons.dismiss(run.uuid, csrftoken);
    if (error) {
      console.error(error.errors);
      run = { ...run, dismissed: false }; // put it back
    } else {
      run = data;
    }
  }

  // todo
  async function cancel() {
    const csrftoken = getCsrfToken();
    const { status } = run;
    run = { ...run, status: "cancelled" }; // optimistic update
    const { data, error } = await addons.cancel(run.uuid, csrftoken);
    if (error) {
      run = { ...run, status }; // put it back
    }
  }
</script>

<SidebarItem disabled={run.dismissed || run.status === "cancelled"}>
  <svelte:component this={icons[run.status]} slot="start" />
  {run.addon.name}
  <Flex slot="end">
    <Button minW={false} ghost on:click={dismiss}>
      {$_("dialog.dismiss")}
    </Button>
    {#if is_running}
      <Button
        minW={false}
        mode="danger"
        ghost
        disabled={!is_running}
        on:click={cancel}
        title={$_("dialog.cancel")}
      >
        <XCircle16 />
      </Button>
    {/if}
    <!-- todo: retry -->
  </Flex>
</SidebarItem>
