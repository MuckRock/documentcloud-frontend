<script lang="ts">
  import type { RunStatus } from "$lib/api/types";

  import { _ } from "svelte-i18n";

  import AddOns from "./AddOns.svelte";
  import Documents, { getStatus } from "./Documents.svelte";
  import {
    getPendingDocuments,
    getRunningAddons,
  } from "./ProcessContext.svelte";
  import ProcessSummary from "./ProcessSummary.svelte";
  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  const totalCounts: Record<RunStatus, number> = {
    queued: 0,
    in_progress: 0,
    cancelled: 0,
    success: 0,
    failure: 0,
  };

  function sumCounts(counts: Record<RunStatus, number>) {
    return Object.values(counts).reduce((acc, cur) => acc + cur, 0);
  }

  const running = getRunningAddons();
  const current = getPendingDocuments();

  $: addons = $running
    ?.filter((r) => !r.dismissed)
    .reduce(
      (acc, cur) => {
        const curCount = acc[cur.status] ?? 0;
        acc[cur.status] = curCount + 1;
        return acc;
      },
      {} as Record<RunStatus, number>,
    );

  $: documents = $current?.reduce(
    (acc, cur) => {
      const status = getStatus(cur);
      const curCount = acc[status] ?? 0;
      acc[status] = curCount + 1;
      return acc;
    },
    {} as Record<RunStatus, number>,
  );

  $: for (const status of Object.keys(totalCounts)) {
    totalCounts[status] = (addons?.[status] || 0) + (documents?.[status] || 0);
  }

  $: total = sumCounts(totalCounts);
</script>

{#if total > 0}
  <Dropdown>
    <SidebarItem slot="anchor">
      <ProcessSummary counts={totalCounts} />
    </SidebarItem>
    <Menu>
      <AddOns />
      <Documents />
    </Menu>
  </Dropdown>
{/if}
