<!-- @component
Fetch and display status of all running add-ons.
This component should update on a timer.
-->
<script lang="ts">
  import { afterUpdate, onMount, onDestroy } from "svelte";
  import { flip } from "svelte/animate";
  import { _ } from "svelte-i18n";
  import { Plug16, Thumbsdown16, Thumbsup16, XCircle16 } from "svelte-octicons";

  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Process from "./Process.svelte";

  import { POLL_INTERVAL } from "@/config/config";
  import { history, dismiss, cancel, rate } from "$lib/api/addons";
  import { getCsrfToken } from "$lib/utils/api";
  import type { Run } from "@/addons/types";
  import { getAddons } from "./ProcessContext.svelte";

  let timeout: string | number | NodeJS.Timeout;

  const running = getAddons();

  onMount(async () => {
    if ($running.length === 0) {
      await load();
    }
  });

  afterUpdate(() => {
    if ($running.length > 0) {
      timeout = setTimeout(load, POLL_INTERVAL);
    }
  });

  onDestroy(() => {
    stop();
  });

  function stop() {
    clearTimeout(timeout);
    timeout = null;
  }

  async function load() {
    const { data, error } = await history({ dismissed: false, per_page: 100 });
    if (!error) {
      $running = data.results;
    }
  }

  async function rateRun(rating: number, run: Run) {
    const csrftoken = getCsrfToken();
    const prevRating = run.rating;
    run = { ...run, rating }; // optimistic update
    const { data, error } = await rate(run.uuid, rating, csrftoken);
    if (error) {
      console.error(error.errors);
      run = { ...run, rating: prevRating }; // put it back
    } else {
      run = data;
    }
  }

  async function dismissRun(run: Run) {
    const csrftoken = getCsrfToken();
    run = { ...run, dismissed: true }; // optimistic update
    const { data, error } = await dismiss(run.uuid, csrftoken);
    if (error) {
      console.error(error.errors);
      run = { ...run, dismissed: false }; // put it back
    } else {
      run = data;
    }
  }

  // todo
  async function cancelRun(run: Run) {
    const csrftoken = getCsrfToken();
    const { status } = run;
    run = { ...run, status: "cancelled" }; // optimistic update
    const { data, error } = await cancel(run.uuid, csrftoken);
    if (error) {
      run = { ...run, status }; // put it back
    }
  }
</script>

{#if $running.length > 0}
  <SidebarGroup name="processing.addons">
    <SidebarItem slot="title">
      <Plug16 slot="start" />
      {$_("processing.addons")}
    </SidebarItem>

    {#each $running as run (run.uuid)}
      <div role="menuitem" animate:flip>
        <Process name={run.addon.name} status={run.status}>
          <Flex slot="actions" let:isRunning>
            {#if isRunning}
              <!-- Cancel -->
              <Button
                minW={false}
                mode="danger"
                ghost
                on:click={() => cancelRun(run)}
                title={$_("dialog.cancel")}
              >
                <XCircle16 />
              </Button>
            {:else}
              <Button
                size="small"
                minW={false}
                ghost
                on:click={() => dismissRun(run)}
              >
                {$_("dialog.dismiss")}
              </Button>
              <Button
                size="small"
                ghost
                minW={false}
                mode="success"
                on:click={() => rateRun(1, run)}
              >
                <Thumbsup16 />
              </Button>
              <Button
                size="small"
                ghost
                minW={false}
                mode="danger"
                on:click={() => rateRun(-1, run)}
              >
                <Thumbsdown16 />
              </Button>
              <!-- todo: retry -->
            {/if}
          </Flex>
        </Process>
      </div>
    {/each}
  </SidebarGroup>
{/if}
