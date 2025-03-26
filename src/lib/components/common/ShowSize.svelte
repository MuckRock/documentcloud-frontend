<script lang="ts">
  import { MAX_EDIT_BATCH } from "@/config/config.js";

  export let size: number;
</script>

{#if size >= 1 && size <= MAX_EDIT_BATCH}
  <!-- Size is good, show default slot -->
  <slot />
{:else if size > MAX_EDIT_BATCH}
  <!-- Size is over the limit -->
  <slot name="oversize" />
{:else}
  <!-- Size is empty -->
  <slot name="empty" />
{/if}
