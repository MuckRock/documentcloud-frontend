<script lang="ts">
  import type { Status } from "@/addons/types";

  import { fly } from "svelte/transition";
  import { _ } from "svelte-i18n";

  import AddOns from "./AddOns.svelte";
  import Documents, { getStatus } from "./Documents.svelte";
  import {
    getPendingDocuments,
    getRunningAddons,
  } from "./ProcessContext.svelte";
  import ProcessSummary from "./ProcessSummary.svelte";

  const totalCounts: Record<Status, number> = {
    queued: 0,
    in_progress: 0,
    cancelled: 0,
    success: 0,
    failure: 0,
  };

  function sumCounts(counts: Record<Status, number>) {
    return Object.values(counts).reduce((acc, cur) => acc + cur, 0);
  }

  const running = getRunningAddons();
  const current = getPendingDocuments();

  $: addons = $running.reduce(
    (acc, cur) => {
      const curCount = acc[cur.status] ?? 0;
      acc[cur.status] = curCount + 1;
      return acc;
    },
    {} as Record<Status, number>,
  );

  $: documents = $current.reduce(
    (acc, cur) => {
      const status = getStatus(cur);
      const curCount = acc[status] ?? 0;
      acc[status] = curCount + 1;
      return acc;
    },
    {} as Record<Status, number>,
  );

  $: for (const status of Object.keys(totalCounts)) {
    totalCounts[status] = (addons[status] || 0) + (documents[status] || 0);
  }

  $: total = sumCounts(totalCounts);
</script>

<div class="drawer" class:zero={total === 0} role="menu" tabindex="0">
  <header>
    <h3>{$_("processing.totalCount", { values: { n: total } })}</h3>
    <ProcessSummary counts={totalCounts} />
  </header>
  <main>
    <AddOns />
    <Documents />
  </main>
</div>

<style>
  .drawer {
    display: flex;
    flex-direction: column;
    width: 20rem;
    background: var(--white);
    box-shadow: var(--shadow-1);
    border: 1px solid var(--gray-2);

    position: fixed;
    bottom: 0;
    right: 0;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    max-height: 50%;
    overflow-y: auto;

    transform: translateY(calc(100% - 2.25rem));
    transition: transform 0.5s ease-in-out;

    z-index: var(--z-drawer);
  }

  .drawer:hover,
  .drawer:focus,
  .drawer:focus-within {
    transform: translateY(0%);
  }
  .drawer.zero {
    display: none;
  }

  header,
  main {
    display: flex;
    padding: 0.5rem;
    gap: 0.5rem;
  }
  header {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--white);
    font-weight: var(--font-semibold);
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 1px solid var(--gray-2);
  }
  h3 {
    font-weight: var(--font-semibold);
  }
  main {
    flex-direction: column;
  }
</style>
