<script context="module" lang="ts">
  import { writable } from "svelte/store";

  export const runs = writable([]);
  export const cancelled = writable([]);
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import type { Run } from "../runs/HistoryEvent.svelte";

  // Components
  import Progress from "../../common/Progress.svelte";
  import Button from "../../common/Button.svelte";

  import { baseApiUrl } from "../../api/base.js";
  import { getCsrfToken } from "../../api/session.js";

  export let run: Run;
  export let compact = false;

  let comment = "";

  $: failure = run.status === "failure";
  $: done = run.status !== "queued" && run.status !== "in_progress";

  function getStatus(status) {
    if (status === "cancelled") {
      return $_("addonProgress.timedOut");
    }
    return status
      .split("_")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }

  async function update(params: any, method = "PATCH") {
    const endpoint = new URL(`/api/addon_runs/${run.uuid}/`, baseApiUrl);

    if (method !== "DELETE") {
      endpoint.searchParams.set("expand", "addon");
    }

    const csrftoken = getCsrfToken();
    const options: RequestInit = {
      credentials: "include",
      headers: { "X-CSRFToken": csrftoken },
      method,
    };

    if (method !== "DELETE") {
      options.body = JSON.stringify(params);
      options.headers["Content-type"] = "application/json";
    }

    const resp = await fetch(endpoint, options);

    if (!resp.ok) {
      throw new Error(resp.statusText);
    }

    // delete returns an empty response
    if (method !== "DELETE") {
      return resp.json();
    }
  }

  export async function dismiss() {
    run = await update({ dismissed: true });
    $runs = $runs.filter((r) => r.uuid !== run.uuid);
  }

  export async function cancel() {
    $cancelled = [...$cancelled, run.uuid];
    await update({}, "DELETE");
  }

  function thumbsUp() {
    rate(1);
  }

  function thumbsDown() {
    rate(-1);
  }

  async function rate(val) {
    const newVal = run.rating === val ? 0 : val;
    run = await update({ rating: newVal });
  }

  async function submitFeedback() {
    run = await update({ comment });
  }

  function date_format(s: string) {
    return new Date(s).toLocaleString();
  }
</script>

<style>
  .dismiss {
    margin: 0 1px 0 14px;
  }

  .valign,
  .dismiss {
    display: inline-block;
    vertical-align: middle;
  }

  .info {
    font-weight: bold;
    display: inline-block;
    vertical-align: middle;
    padding-right: 20px;
    width: 20%;
  }

  .info.compact {
    width: 100%;
    padding-right: 0;
  }

  .message {
    display: block;
    width: 100%;
  }

  .addonRun {
    padding: 8px 20px;
    border-top: 1px solid rgba(128, 128, 128, 0.15);
  }

  .failure,
  .cancelled {
    background: var(--errorbg);
  }

  .failure .info,
  .cancelled .info {
    color: var(--caution);
  }

  .rate {
    display: inline-block;
    vertical-align: top;
  }

  a {
    text-decoration: underline;
  }

  a:hover {
    filter: brightness(85%);
  }
</style>

<div class="addonRun {run.status}">
  <div class="info processingText" class:compact>
    {#if compact}
      {date_format(run.created_at)}
    {:else}
      {run.addon.name}
    {/if}
    - {getStatus(run.status)}
  </div>
  {#if !compact}
    <Progress
      progress={done ? 1 : run.progress / 100}
      initializing={run.progress == 0 && !done}
      compact={run.progress == 0 && !done}
      {failure}
    />
    <span class="dismiss">
      <Button on:click={dismiss} small danger={failure}>
        {$_("dialog.dismiss")}
      </Button>
    </span>
    {#if done}
      <span class="rate">
        <Button on:click={thumbsUp} small secondary={run.rating !== 1}>
          &#x1F44D;
        </Button>
        <Button on:click={thumbsDown} small secondary={run.rating !== -1}
          >&#x1F44E;
        </Button>

        {#if run.rating !== 0}
          <span class="info processingText message comment" class:compact>
            {#if run.comment === ""}
              <input
                placeholder={$_("addonProgres.feedback")}
                maxlength="255"
                bind:value={comment}
              />
              <Button small on:click={submitFeedback}>Submit</Button>
            {:else}
              <span>Thanks for the feedback!</span>
            {/if}
          </span>
        {/if}
      </span>
    {:else}
      <span class="cancel">
        {#if $cancelled.includes(run.uuid)}
          <Button small danger disabled>
            {$_("dialog.cancelling")}
          </Button>
        {:else}
          <Button small danger on:click={cancel}>
            {$_("dialog.cancel")}
          </Button>
        {/if}
      </span>
    {/if}
  {/if}
  {#if run.message || run.file_url}
    <div class="info message processingText" class:compact>
      {#if run.message}{run.message}{/if}
      {#if run.message && run.file_url} - {/if}
      {#if run.file_url}<a href={run.file_url}>Download File</a>{/if}
    </div>
  {/if}
</div>
