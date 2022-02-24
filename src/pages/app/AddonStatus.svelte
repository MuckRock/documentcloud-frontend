<script>
  import { _ } from "svelte-i18n";

  // Components
  import Progress from "@/common/Progress";
  import Button from "@/common/Button";

  // Store properties
  import { addons, removeRun } from "@/manager/addons";

  import { dismissAddonRun } from "@/api/addon";

  function getStatus(status) {
    return status
      .split("_")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }

  function done(run) {
    return run.status != "queued" && run.status != "in_progress";
  }

  function dismiss(uuid) {
    removeRun(uuid);
    dismissAddonRun(uuid);
  }
</script>

<style lang="scss">
  .addonStatus {
    background: #eff7ff;
    border-radius: $radius;
    padding: 0;
    margin: 20px 0;

    .dismiss {
      margin: 0 1px 0 14px;
    }

    .valign,
    .dismiss {
      display: inline-block;
      vertical-align: middle;
    }

    .info {
      @include processingText;

      font-weight: bold;
      display: inline-block;
      vertical-align: middle;
      padding-right: 20px;
      width: 20%;
    }

    .title {
      font-weight: bold;
      display: inline-block;
      vertical-align: middle;
      font-size: 18px;
      padding: 8px 20px;
    }

    .message {
      display: block;
      width: 100%;
    }

    .addonRun {
      padding: 8px 20px;
      border-top: 1px solid rgba(128, 128, 128, 0.15);
    }

    .failure {
      background: $errorbg;
      .info {
        color: $caution;
      }
    }

    a {
      text-decoration: underline;
      &:hover {
        filter: brightness(85%);
      }
    }
  }
</style>

{#if $addons.runs.length > 0}
  <div class="addonStatus">
    <div class="title">Add-Ons Progress</div>
    {#each $addons.runs as run (run.uuid)}
      <div class="addonRun {run.status}">
        <div class="info">
          {run.addonName} - {getStatus(run.status)}
        </div>
        <Progress
          progress={done(run) ? 1 : run.progress / 100}
          initializing={run.progress == 0 && !done(run)}
          compact={run.progress == 0 && !done(run)}
          failure={run.status == "failure"}
        />
        <span class="dismiss">
          <Button
            small={true}
            on:click={() => dismiss(run.uuid)}
            danger={run.status == "failure"}
          >
            {$_("dialog.dismiss")}
          </Button>
        </span>
        {#if run.message || run.fileUrl}
          <div class="info message">
            {#if run.message}{run.message}{/if}
            {#if run.message && run.fileUrl} - {/if}
            {#if run.fileUrl}
              <a href="{run.fileUrl}" target="_blank">
                Download File
              </a>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
