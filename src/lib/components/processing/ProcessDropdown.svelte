<script lang="ts">
  import type { RunStatus } from "$lib/api/types";

  import AddOns from "./AddOns.svelte";
  import Documents, { getStatus } from "./Documents.svelte";
  import {
    getPendingDocuments,
    getRunningAddons,
  } from "./ProcessContext.svelte";
  import ProcessSummary from "./ProcessSummary.svelte";
  import Dropdown from "../common/Dropdown.svelte";
  import Menu from "../common/Menu.svelte";
  import NavItem from "$lib/components/common/NavItem.svelte";

  const totalCounts: Record<RunStatus, number> = $state({
    queued: 0,
    in_progress: 0,
    cancelled: 0,
    success: 0,
    failure: 0,
  });

  function sumCounts(counts: Record<RunStatus, number>) {
    return Object.values(counts).reduce((acc, cur) => acc + cur, 0);
  }

  const running = getRunningAddons();
  const current = getPendingDocuments();

  let addons = $derived(
    $running
      ?.filter((r) => !r.dismissed)
      .reduce(
        (acc, cur) => {
          const curCount = acc[cur.status] ?? 0;
          acc[cur.status] = curCount + 1;
          return acc;
        },
        {} as Record<RunStatus, number>,
      ),
  );

  let documents = $derived(
    $current?.reduce(
      (acc, cur) => {
        const status = getStatus(cur);
        const curCount = acc[status] ?? 0;
        acc[status] = curCount + 1;
        return acc;
      },
      {} as Record<RunStatus, number>,
    ),
  );

  $effect(() => {
    for (const status of Object.keys(totalCounts)) {
      totalCounts[status] =
        (addons?.[status] || 0) + (documents?.[status] || 0);
    }
  });

  let total = $derived(sumCounts(totalCounts));
</script>

{#if total > 0}
  <Dropdown>
    {#snippet anchor()}
      <NavItem>
        <ProcessSummary counts={totalCounts} />
      </NavItem>
    {/snippet}
    {#snippet inner()}
      <Menu>
        <AddOns />
        <Documents />
      </Menu>
    {/snippet}
  </Dropdown>
{/if}
