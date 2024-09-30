<script lang="ts" context="module">
  import {
    Alert16,
    CheckCircle16,
    IssueDraft16,
    CircleSlash16,
  } from "svelte-octicons";

  export type Status =
    | "in_progress"
    | "queued"
    | "success"
    | "failure"
    | "cancelled";

  export const icons: Record<Status, ComponentType> = {
    cancelled: CircleSlash16,
    in_progress: IssueDraft16,
    queued: IssueDraft16,
    failure: Alert16,
    success: CheckCircle16,
  };
</script>

<script lang="ts">
  import { type ComponentType } from "svelte";

  import { _ } from "svelte-i18n";

  import Flex from "../common/Flex.svelte";
  import type { Maybe } from "@/lib/api/types";

  export let status: Status;
  export let name: string;
  export let progress: Maybe<number> = undefined;

  $: isRunning = ["in_progress", "queued"].includes(status);
</script>

<div class="{status} process">
  <div class="info">
    <div class="icon" class:spin={status === "in_progress"}>
      <svelte:component this={icons[status]} />
    </div>
    <div class="name">{name}</div>
    {#if $$slots.actions}
      <Flex slot="end">
        <slot name="actions" {isRunning} />
      </Flex>
    {/if}
  </div>
  {#if ["success", "failure", "cancelled"].includes(status)}
    <progress value={1} />
  {:else if status === "queued"}
    <progress value={0} />
  {:else if progress}
    <progress value={progress} />
  {:else}
    <progress />
  {/if}
</div>

<style>
  .process {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .queued.process,
  .in_progress.process,
  .cancelled.process {
    fill: var(--gray-4);
  }
  .failure.process {
    fill: var(--red-3);
  }
  .success.process {
    fill: var(--green-3);
  }

  .info {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
  }

  .icon {
    flex: 0 0 0;
  }

  .name {
    flex: 1 1 auto;
    font-weight: var(--font-semibold);
    color: var(--gray-5);
  }

  progress {
    width: 100%;
  }

  .icon {
    display: flex;
    align-items: center;
  }
</style>
