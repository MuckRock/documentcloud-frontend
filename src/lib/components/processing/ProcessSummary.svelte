<script lang="ts">
  import type { Status } from "@/addons/types";

  import Flex from "../common/Flex.svelte";
  import { icons } from "./Process.svelte";

  export let counts: Record<Status, number> = {
    queued: 0,
    in_progress: 0,
    success: 0,
    failure: 0,
    cancelled: 0,
  };
</script>

<Flex align="baseline">
  {#each Object.entries(counts) as [status, count]}
    {#if count > 0}
      <div class="{status} count">
        {count}
        <div class="icon" class:spin={status === "in_progress"}>
          <svelte:component this={icons[status]} />
        </div>
      </div>
    {/if}
  {/each}
</Flex>

<style>
  .count,
  .icon {
    display: inline-flex;
    gap: 0.25rem;
    align-items: center;
    font-weight: var(--font-semibold);
    font-size: var(--font-sm);
  }
  .queued.count,
  .cancelled.count,
  .in_progress.count {
    color: var(--gray-4);
    fill: var(--gray-4);
    order: -1;
  }
  .queued.count {
    order: 1;
  }
  .in_progress.count.count {
    order: 2;
  }
  .success.count {
    color: var(--green-3);
    fill: var(--green-3);
    order: 3;
  }
  .failure.count {
    color: var(--red-3);
    fill: var(--red-3);
    order: 4;
  }
  .cancelled.count {
    order: 5;
  }
</style>
