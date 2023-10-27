<script context="module" lang="ts">
  import Button from "../../common/Button.svelte";
  import type { AddOnListItem } from "../types.ts";
  // https://api.www.documentcloud.org/api/addon_runs/?expand=addon
  export interface Run {
    uuid: string;
    addon: AddOnListItem;
    user: number;
    status: "success" | "failure" | "queued" | "in_progress";
    progress: number;
    message: string;
    file_url?: string | null;
    dismissed: boolean;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
    // TODO: Add credits_spent to run payload
    credits_spent?: number;
  }
</script>

<script lang="ts">
  import {
    CheckCircle24,
    Paperclip16,
    Hourglass24,
    Alert24,
    Question24,
    Sync24,
  } from "svelte-octicons";
  import Price from "../../premium-credits/Price.svelte";

  export let run;

  $: ranAt = new Date(run.created_at);
</script>

<style>
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .addon-run {
    margin: 0.5em;
    display: flex;
    align-items: flex-start;
    gap: 1em;
  }
  .status {
    flex: 0 1 auto;
    margin: 0;
  }
  .success.icon {
    fill: var(--tertiary);
  }
  .failure.icon {
    fill: var(--caution);
  }
  .queued.icon {
    fill: var(--gray);
  }
  .in-progress.icon {
    display: block;
    fill: var(--primary);
    transform-origin: center center;
    animation: spin 2s linear infinite reverse;
    animation-play-state: running;
    & svg {
      display: block;
    }
  }
  .unknown-status.icon {
    fill: var(--gray);
  }
  .row {
    display: flex;
  }
  .info {
    flex: 1 1 auto;
  }
  .info .row {
    align-items: baseline;
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
  .price {
    margin: 0.5em 0 0;
    font-size: 0.8em;
    align-self: flex-end;
  }
</style>

<div class="addon-run" id="run-{run.uuid}">
  <div class="status">
    {#if run.status === "success"}
      <span class="success icon" title="Success"><CheckCircle24 /></span>
    {:else if run.status === "failure"}
      <span class="failure icon" title="Failure"><Alert24 /></span>
    {:else if run.status === "queued"}
      <span class="queued icon" title="Queued"><Hourglass24 /></span>
    {:else if run.status === "in_progress"}
      <span class="in-progress icon" title="In Progress"><Sync24 /></span>
    {:else}
      <span class="unknown-status icon" title="Unknown Status"
        ><Question24 /></span
      >
    {/if}
  </div>
  <div class="info">
    <div class="row">
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
</div>
