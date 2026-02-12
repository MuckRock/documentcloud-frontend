<script lang="ts">
  import type { Nullable } from "$lib/api/types";
  import PageToolbar from "./PageToolbar.svelte";

  interface Props {
    progress?: Nullable<number>;
  }

  let { progress = null }: Props = $props();
</script>

<PageToolbar>
  {#snippet center()}
    <div class="container">
      <p>Loading PDF…</p>
      {#if progress}
        <progress value={progress} data-chromatic="ignore"></progress>
      {:else}
        <progress data-chromatic="ignore"></progress>
      {/if}
    </div>
  {/snippet}
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
