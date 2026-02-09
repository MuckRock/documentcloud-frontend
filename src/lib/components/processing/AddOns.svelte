<!-- @component
Fetch and display status of all running add-ons.
This component should update on a timer.
-->
<script lang="ts">
  import { flip } from "svelte/animate";
  import { _ } from "svelte-i18n";
  import { Plug16 } from "svelte-octicons";

  import Button from "$lib/components/common/Button.svelte";
  import HistoryEvent from "$lib/components/addons/HistoryEvent.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";
  import SidebarGroup from "$lib/components/sidebar/SidebarGroup.svelte";

  import { dismiss } from "$lib/api/addons";
  import { getRunningAddons } from "./ProcessContext.svelte";
  import { getCsrfToken } from "$lib/utils/api";

  // derive a list of running add-ons that are not dismissed
  const running = getRunningAddons();

  async function dismissAll() {
    const csrftoken = getCsrfToken() ?? "";

    if (!$running || !csrftoken) return;

    const promises = $running.map(async (run) => {
      const { data, error } = await dismiss(run.uuid, csrftoken);
      if (data) {
        return data;
      } else {
        console.warn(error);
        return run;
      }
    });

    $running = await Promise.all(promises);
  }
</script>

{#if $running?.length && $running.length > 0}
  <SidebarGroup name="processing.addons">
    {#snippet title()}
      <NavItem>
        <Plug16 slot="start" />
        {$_("processing.addons")}
      </NavItem>
    {/snippet}

    {#snippet action()}
      <Button ghost on:click={dismissAll}>{$_("dialog.dismissAll")}</Button>
    {/snippet}

    {#each $running as run (run.uuid)}
      <div role="menuitem" animate:flip><HistoryEvent {run} dismissable /></div>
    {/each}
  </SidebarGroup>
{/if}
