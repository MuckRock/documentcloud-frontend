<script context="module" lang="ts">
  import Button from "../../common/Button.svelte";
  import type { AddOnListItem } from "../browser/AddOnListItem.svelte";
  // https://api.www.documentcloud.org/api/addon_runs/?expand=addon
  export interface Run {
    uuid: string;
    addon: AddOnListItem;
    user: number;
    status: "success" | "failure";
    progress: number;
    message: string;
    file_url?: string | null;
    dismissed: boolean;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
  }
</script>

<script lang="ts">
  import { CheckCircle24, Paperclip16, XCircle24 } from "svelte-octicons";

  export let run;

  $: ranAt = new Date(run.created_at);
</script>

<style>
  .addon-run {
    margin: 0.5em;
    display: flex;
    align-items: flex-start;
    gap: 0.5em;
  }
  .status {
    flex: 0 1 auto;
    margin: 0.25em;
  }
  .success.icon {
    fill: var(--tertiary);
  }
  .failure.icon {
    fill: var(--caution);
  }
  .info {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .primary-info {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    gap: 0.5em;
  }
  .name {
    margin: 0;
    font-weight: 600;
  }
  .date {
    flex: 0 1 auto;
    font-size: 0.8em;
    color: var(--gray);
  }
  .message {
    flex: 1 1 100%;
    margin: 0.5em 0 0;
    font-size: 0.8em;
    font-style: italic;
  }
</style>

<div class="addon-run" id="run-{run.uuid}">
  <div class="status">
    {#if run.status === "success"}
      <span class="success icon" title="Success"><CheckCircle24 /></span>
    {:else}
      <span class="failure icon" title="Failure"><XCircle24 /></span>
    {/if}
  </div>
  <div class="info">
    <div class="primary-info">
      <p class="name">{run.addon.name}</p>
      {#if run.file_url}<Button action href={run.file_url}
          ><Paperclip16 />Download File</Button
        >{/if}
    </div>
    <time
      class="date"
      datetime={ranAt.toISOString()}
      title={ranAt.toISOString()}>{ranAt.toLocaleString()}</time
    >
    {#if run.message}<p class="message">{run.message}</p>{/if}
  </div>
</div>
