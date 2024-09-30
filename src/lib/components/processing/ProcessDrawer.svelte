<script lang="ts">
  import { fly } from "svelte/transition";
  import AddOns, { running } from "./AddOns.svelte";
  import Documents, { current, getStatus } from "./Documents.svelte";
  import type { Status } from "./Process.svelte";
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
      console.log(acc, cur);
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
  $: totalAddons = sumCounts(addons);
  $: totalDocuments = sumCounts(documents);
  $: {
    console.log(addons, documents, totalCounts);
  }
</script>

{#if total > 0}
  <div
    class="drawer"
    role="menu"
    tabindex="0"
    transition:fly={{ opacity: 100, y: 40 }}
  >
    <header>
      <h3>{total} active processes</h3>
      <ProcessSummary counts={totalCounts} />
    </header>
    <main>
      <AddOns />
      <Documents />
    </main>
  </div>
{/if}

<style>
  .drawer {
    min-width: 18rem;
    background: var(--white);
    box-shadow: var(--shadow-1);
    border: 1px solid var(--gray-2);

    position: fixed;
    bottom: 0;
    right: 0;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;

    transform: translateY(calc(100% - 2.25rem));
    transition: transform 0.25s ease-in-out;

    z-index: var(--z-drawer);
  }
  .drawer:hover,
  .drawer:focus,
  .drawer:focus-within {
    transform: translateY(0%);
  }
  header,
  main {
    display: flex;
    padding: 0.5rem;
    gap: 0.5rem;
  }
  header {
    font-weight: var(--font-semibold);
    align-items: baseline;
    justify-content: space-between;
    border-bottom: 1px solid var(--gray-2);
  }
  main {
    flex-direction: column;
  }
</style>
