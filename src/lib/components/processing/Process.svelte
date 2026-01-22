<script lang="ts" module>
  import type { ComponentType, Snippet } from "svelte";
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

  interface Props {
    dismissed?: boolean;
    id?: Maybe<string>;
    progress?: Maybe<number>;
    spin?: boolean;
    status: RunStatus;
    icon?: Snippet;
    children?: Snippet;
    actions?: Snippet<[any]>;
  }

  let {
    dismissed = false,
    id = undefined,
    progress = undefined,
    spin = false,
    status,
    icon,
    children,
    actions,
  }: Props = $props();

  let isRunning = $derived(["in_progress", "queued"].includes(status));

  const SvelteComponent = $derived(icons[status]);
</script>

<div {id} class="{status} process" class:dismissed>
  <div class="info">
    <div class="icon" class:spin>
      {#if icon}{@render icon()}{:else}
        <SvelteComponent />
      {/if}
    </div>

    <div class="details">
      {@render children?.()}
    </div>
    {#if actions}
      <Flex>
        {@render actions?.({ isRunning })}
      </Flex>
    {/if}
  </div>
  {#if ["success", "failure", "cancelled"].includes(status)}
    <progress value={1} data-chromatic="ignore"></progress>
  {:else if status === "queued"}
    <progress value={0} data-chromatic="ignore"></progress>
  {:else if progress}
    <progress value={progress} data-chromatic="ignore"></progress>
  {:else}
    <progress data-chromatic="ignore"></progress>
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

  .dismissed {
    opacity: 0.75;
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
    height: var(--height, 8px);
  }

  .icon {
    display: flex;
    align-items: center;
  }
</style>
