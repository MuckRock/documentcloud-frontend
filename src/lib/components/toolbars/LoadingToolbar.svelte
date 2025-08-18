<script lang="ts">
  import type { Nullable } from "$lib/api/types";
  import PageToolbar from "../common/PageToolbar.svelte";

  export let progress: Nullable<number> = null;
</script>

<PageToolbar>
  <div class="container" slot="center">
    <p>Loading PDF…</p>
    {#if progress}
      <progress value={progress} data-chromatic="ignore" />
    {:else}
      <progress data-chromatic="ignore" />
    {/if}
  </div>
</PageToolbar>

<style>
  .container {
    padding: 0 0.5rem;
    display: flex;
    gap: 2rem;
    align-items: center;
  }
  p {
    flex: 0 1 auto;
    font-weight: var(--font-semibold);
    color: var(--gray-4);
  }
  progress {
    flex: 1 1 auto;
  }
</style>
