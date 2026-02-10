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
    return Object.values(counts).reduce((m, count) => m + count, 0);
  }

  const running = getRunningAddons();
  const current = getPendingDocuments();

  let addons = $derived(
    $running?.reduce(
      (m, run) => {
        const count = m[run.status] ?? 0;
        m[run.status] = count + 1;
        return m;
      },
      {} as Record<RunStatus, number>,
    ),
  );

  let documents = $derived(
    $current?.reduce(
      (m, doc) => {
        const status = getStatus(doc);
        const count = m[status] ?? 0;
        m[status] = count + 1;
        return m;
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
    <NavItem slot="anchor">
      <ProcessSummary counts={totalCounts} />
    </NavItem>
    <Menu slot="inner">
      <AddOns />
      <Documents />
    </Menu>
  </Dropdown>
{/if}
