<script lang="ts">
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";

  import AddonRun, { runs } from "./AddonRun.svelte";
  import { baseApiUrl } from "../../api/base.js";

  const endpoint = new URL(
    "/api/addon_runs/?expand=addon&dismissed=false",
    baseApiUrl,
  );

  const options: RequestInit = {
    credentials: "include",
  };

  async function load() {
    const resp = await fetch(endpoint, options);

    if (!resp.ok) {
      throw new Error(resp.statusText);
    }

    const { results } = await resp.json();
    $runs = results;
  }

  onMount(async () => {
    await load();
  });
</script>

<style>
  .addonStatus {
    background: #eff7ff;
    border-radius: var(--radius, 3px);
    padding: 0;
    margin: 20px 0;
  }

  .addonStatus .title {
    font-weight: bold;
    display: inline-block;
    vertical-align: middle;
    font-size: 18px;
    padding: 8px 20px;
  }
</style>

{#if $runs.length > 0}
  <div class="addonStatus">
    <div class="title">Add-Ons Progress</div>
    {#each $runs as run (run.uuid)}
      <AddonRun {run} />
    {/each}
  </div>
{/if}
