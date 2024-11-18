<script lang="ts" context="module">
  import type { ComponentType } from "svelte";
  import type { Maybe, RunStatus } from "$lib/api/types";
  import {
    Alert16,
    CheckCircle16,
    IssueDraft16,
    CircleSlash16,
  } from "svelte-octicons";

  export const icons: Record<RunStatus, ComponentType> = {
    cancelled: CircleSlash16,
    in_progress: IssueDraft16,
    queued: IssueDraft16,
    failure: Alert16,
    success: CheckCircle16,
  };
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";

  import Flex from "../common/Flex.svelte";

  export let status: RunStatus;
  export let name: string;
  export let href: Maybe<string> = undefined;
  export let progress: Maybe<number> = undefined;

  $: isRunning = ["in_progress", "queued"].includes(status);
</script>

<div class="{status} process">
  <div class="info">
    <div class="icon" class:spin={status === "in_progress"}>
      <svelte:component this={icons[status]} />
    </div>
    {#if href}
      <a {href} class="name">{name}</a>
    {:else}
      <span class="name">{name}</span>
    {/if}
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
    min-width: 20rem;
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
  a.name:hover {
    color: var(--blue-3);
  }

  progress {
    width: 100%;
  }

  .icon {
    display: flex;
    align-items: center;
  }
</style>
