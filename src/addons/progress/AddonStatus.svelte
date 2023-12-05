<script lang="ts">
  import { _ } from "svelte-i18n";
  import { afterUpdate, onMount } from "svelte";

  import AddonRun, { runs } from "./AddonRun.svelte";
  import { baseApiUrl } from "../../api/base.js";

  const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL, 10);

  const endpoint = new URL(
    "/api/addon_runs/?expand=addon&dismissed=false&per_page=20",
    baseApiUrl,
  );

  const options: RequestInit = {
    credentials: "include",
  };

  let timeout;

  async function load() {
    const resp = await fetch(endpoint, options);

    if (!resp.ok) {
      // just bail on errors and try again next cycle
      return console.error(
        `Failed to load add-on run status: ${resp.statusText}`,
      );
    }

    const { results } = await resp.json();
    $runs = results;
  }

  onMount(async () => {
    await load();
  });

  afterUpdate(() => {
    if ($runs.length > 0) {
      timeout = setTimeout(load, POLL_INTERVAL);
    }
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
    <h3 class="title">{$_("addonProgress.progress")}</h3>
    {#each $runs as run (run.uuid)}
      <AddonRun {run} />
    {/each}
  </div>
{/if}
