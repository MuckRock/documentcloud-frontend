<!-- @component
Fetch and display status of all running add-ons.
This component should update on a timer.
-->
<script lang="ts">
  import { flip } from "svelte/animate";
  import { _ } from "svelte-i18n";
  import { Plug16 } from "svelte-octicons";

  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";

  import HistoryEvent from "../addons/HistoryEvent.svelte";

  import { getRunningAddons } from "./ProcessContext.svelte";

  const running = getRunningAddons();
  // derive a list of running add-ons that are not dismissed
</script>

{#if $running?.length && $running.length > 0}
  <SidebarGroup name="processing.addons">
    {#snippet title()}
      <NavItem>
        <Plug16 slot="start" />
        {$_("processing.addons")}
      </NavItem>
    {/snippet}

    {#each $running as run (run.uuid)}
      <div role="menuitem" animate:flip><HistoryEvent {run} dismissable /></div>
    {/each}
  </SidebarGroup>
{/if}
