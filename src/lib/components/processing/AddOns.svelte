<!-- @component
Fetch and display status of all running add-ons.
This component should update on a timer.
-->
<script lang="ts">
  import { flip } from "svelte/animate";
  import { _ } from "svelte-i18n";
  import { derived, writable } from "svelte/store";
  import { Plug16, Thumbsdown16, Thumbsup16, XCircle16 } from "svelte-octicons";

  import SidebarGroup from "../sidebar/SidebarGroup.svelte";
  import SidebarItem from "../sidebar/SidebarItem.svelte";

  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Process from "./Process.svelte";

  import { dismiss, cancel, rate } from "$lib/api/addons";
  import type { Maybe, Nullable, Run } from "$lib/api/types";
  import { getCsrfToken } from "$lib/utils/api";
  import { getRunningAddons } from "./ProcessContext.svelte";

  let timeout: Nullable<string | number | NodeJS.Timeout>;

  const running = getRunningAddons();
  // derive a list of running add-ons that are not dismissed
  const undismissed = derived(running ?? writable([]), ($running) =>
    $running?.filter((run) => !run.dismissed),
  );

  let rated: Record<string, number> = {};

  function optimisticUpdate(run: Run) {
    let originalValue: Maybe<Run> = undefined;
    // Replace the run in the store with the updated value
    running?.update((runs) => {
      const index = runs.findIndex((r) => r.uuid === run.uuid);
      // We aren't adding runs here, only update existing ones.
      // So if the index can't be found, just return the existing array.
      if (index === -1) return runs;
      originalValue = runs[index];
      runs[index] = run;
      return runs;
    });
    // Return a function that lets us restore the original value
    return () => {
      running?.update((runs) => {
        const index = runs.findIndex(
          (r) => originalValue && r.uuid === originalValue.uuid,
        );
        if (originalValue && index !== -1) runs[index] = originalValue;
        return runs;
      });
    };
  }

  async function rateRun(rating: number, run: Run) {
    const csrftoken = getCsrfToken();
    if (!csrftoken) {
      console.error("No CSRF token");
      return;
    }
    const restore = optimisticUpdate({ ...run, rating });
    rated[run.uuid] = rating;
    const { data, error } = await rate(run.uuid, rating, csrftoken);
    if (error || !data) {
      console.warn(error?.errors ?? "No data");
      restore();
      delete rated[run.uuid];
    } else {
      optimisticUpdate(data);
    }
  }

  async function dismissRun(run: Run) {
    const restore = optimisticUpdate({ ...run, dismissed: true });
    const csrftoken = getCsrfToken();
    if (!csrftoken) {
      console.warn("No CSRF token");
      restore();
      return;
    }
    const { data, error } = await dismiss(run.uuid, csrftoken);
    if (error || !data) {
      console.warn(error?.errors ?? "No data");
      restore();
    } else {
      optimisticUpdate(data);
    }
  }

  // todo
  async function cancelRun(run: Run) {
    const csrftoken = getCsrfToken();
    if (!csrftoken) {
      console.error("No CSRF token");
      return;
    }
    const restore = optimisticUpdate({ ...run, status: "cancelled" });
    const { data, error } = await cancel(run.uuid, csrftoken);
    if (error || !data) {
      restore();
    }
  }
</script>

{#if $undismissed?.length && $undismissed.length > 0}
  <SidebarGroup name="processing.addons">
    <SidebarItem slot="title">
      <Plug16 slot="start" />
      {$_("processing.addons")}
    </SidebarItem>

    {#each $undismissed as run (run.uuid)}
      <div role="menuitem" animate:flip>
        <Process
          name={run.addon?.name ?? "Unnamed Run"}
          href={`/add-ons/${run.addon?.repository}/#history`}
          status={run.status}
        >
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
                hover={rated[run.uuid] === 1}
                on:click={() => rateRun(1, run)}
              >
                <Thumbsup16 />
              </Button>
              <Button
                size="small"
                ghost
                minW={false}
                mode="danger"
                hover={rated[run.uuid] === -1}
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
