<script lang="ts">
  import { MAX_EDIT_BATCH } from "@/config/config.js";

  export let size: number;
  export let limit: number = MAX_EDIT_BATCH;
</script>

{#if size >= 1 && size <= limit}
  <!-- Size is good, show default slot -->
  <slot />
{:else if size > limit}
  <!-- Size is over the limit -->
  <slot name="oversize" />
{:else}
  <!-- Size is empty -->
  <slot name="empty" />
{/if}
