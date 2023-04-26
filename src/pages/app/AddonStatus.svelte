<script>
  import AddonRun from "@/common/AddonRun.svelte";
  import { addons } from "@/manager/addons.js";
</script>

<style>
  .addonStatus {
    background: #eff7ff;
    border-radius: var(--radius, 3px);
    padding: 0;
    margin: 20px 0;
  }

  .addonStatus .title {
    font-weight: bold;
    display: inline-block;
    vertical-align: middle;
    font-size: 18px;
    padding: 8px 20px;
  }
</style>

{#if $addons.runs.length > 0}
  <div class="addonStatus">
    <div class="title">Add-Ons Progress</div>
    {#each $addons.runs as run (run.uuid)}
      <AddonRun {run} />
    {/each}
  </div>
{/if}
