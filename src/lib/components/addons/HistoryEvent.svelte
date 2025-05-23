<script lang="ts">
  import type { Maybe, Run, RunStatus } from "$lib/api/types";
  import { onMount, type ComponentType } from "svelte";

  import { _ } from "svelte-i18n";
  import {
    CheckCircle24,
    Paperclip16,
    Hourglass24,
    Alert24,
    Sync24,
    X24,
    XCircle16,
  } from "svelte-octicons";

  import Action from "../common/Action.svelte";
  import Button from "../common/Button.svelte";
  import Flex from "../common/Flex.svelte";
  import Price from "../premium-credits/Price.svelte";
  import Process from "../processing/Process.svelte";

  import * as addons from "$lib/api/addons";
  import { getCsrfToken } from "$lib/utils/api";

  export let run: Run;
  export let dismissable = false;

  let csrftoken: Maybe<string> = undefined;

  $: ranAt = new Date(run.created_at);
  $: isRunning = ["in_progress", "queued"].includes(run.status);

  const icons: Record<RunStatus, ComponentType> = {
    success: CheckCircle24,
    failure: Alert24,
    queued: Hourglass24,
    in_progress: Sync24,
    cancelled: X24,
  };

  onMount(() => {
    csrftoken = getCsrfToken();
  });

  async function cancelRun() {
    if (!csrftoken) return;

    // optimistic update
    const prior = run.status;
    run.status = "cancelled";

    const { data, error } = await addons.cancel(run.uuid, csrftoken);

    if (error) {
      // todo: show error
      run.status = prior;
    }

    if (data) {
      run = data;
    }
  }

  async function dismissRun() {
    if (!csrftoken) return;

    run.dismissed = true;

    const { data, error } = await addons.dismiss(run.uuid, csrftoken);

    if (error) {
      // todo: show error
      run.dismissed = false;
    }

    if (data) {
      run = data;
    }
  }
</script>

<Process
  id="run-{run.uuid}"
  status={run.status}
  progress={run.progress}
  dismissed={dismissable && run.dismissed}
>
  <svelte:component this={icons[run.status]} slot="icon" />
  <div class="info">
    <div class="row">
      <div class="primary-info">
        <p class="name">{run.addon.name}</p>
        {#if run.file_url}
          <a href={run.file_url} download>
            <Action>
              <Paperclip16 />{$_("processing.download")}
            </Action>
          </a>
        {/if}
      </div>
      <time
        class="date"
        datetime={ranAt.toISOString()}
        title={ranAt.toISOString()}
      >
        {ranAt.toLocaleString()}
      </time>
    </div>
    <div class="row">
      {#if run.message}
        <p class="message">{run.message}</p>
      {/if}
      {#if run.credits_spent}
        <p class="price">
          <Price value={run.credits_spent} />
        </p>
      {/if}
    </div>
  </div>

  <Flex slot="actions">
    {#if isRunning}
      <!-- Cancel -->
      <Button
        minW={false}
        mode="danger"
        ghost
        disabled={!csrftoken}
        on:click={() => cancelRun()}
        title={$_("dialog.cancel")}
      >
        <XCircle16 />
      </Button>
    {:else if dismissable && !run.dismissed}
      <Button
        size="small"
        minW={false}
        ghost
        disabled={!csrftoken}
        on:click={() => dismissRun()}
      >
        {$_("dialog.dismiss")}
      </Button>
      <!-- todo: retry -->
    {/if}
  </Flex>
</Process>

<style>
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .row {
    display: flex;
  }
  .info {
    flex: 1 1 auto;
  }
  .info .row {
    gap: 1rem;
    align-items: baseline;
    justify-content: space-between;
  }
  .primary-info {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5em;
  }
  .name {
    flex: 0 1 auto;
    font-weight: 600;
  }
  .date {
    flex: 0 1 auto;
    font-size: 0.8em;
    color: var(--gray-5);
  }
  .message {
    flex: 1 1 100%;
    margin: 0.5em 0 0;
    font-size: 0.8em;
    font-style: italic;
  }
  .price {
    margin: 0.5em 0 0;
    font-size: 0.8em;
    align-self: flex-end;
  }
</style>
