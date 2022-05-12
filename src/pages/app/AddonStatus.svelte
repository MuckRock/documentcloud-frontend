<script>
  import AddonRun from "@/common/AddonRun";
  import { addons } from "@/manager/addons";
</script>

<style lang="scss">
  .addonStatus {
    background: #eff7ff;
    border-radius: $radius;
    padding: 0;
    margin: 20px 0;

    .title {
      font-weight: bold;
      display: inline-block;
      vertical-align: middle;
      font-size: 18px;
      padding: 8px 20px;
    }
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
