<script lang="ts" context="module">
  export interface Revision {
    version: number;
    user: number;
    created_at: string;
    comment: string;
    url: string;
  }
</script>

<script lang="ts">
  import { _ } from "svelte-i18n";
  import Tooltip from "./Tooltip.svelte";

  // SVG assets
  import History16 from "svelte-octicons/lib/History16.svelte";

  export let revisions: Revision[] | null;
  export let showCount: boolean = false;

  const tooltipText = $_("revisionIcon.tooltip", {
    values: { count: revisions?.length },
  });
</script>

{#if revisions !== null}
  <Tooltip caption={tooltipText}>
    <button class="revisions buttonLike" on:click={() => {}}>
      <History16 />
      {#if showCount}<span class="count">{revisions.length}</span>{/if}
    </button>
  </Tooltip>
{/if}

<style>
  .revisions {
    display: flex;
    align-items: center;
    gap: 0.25em;
    cursor: default;
  }

  .revisions:hover {
    opacity: 1;
  }

  .count {
    font-size: 12px;
    font-weight: 600;
    color: var(--viewerLink, #004276);
    vertical-align: middle;
    margin-left: 2px;
  }
</style>
