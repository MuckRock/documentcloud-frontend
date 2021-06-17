<script>
  import { handlePlural } from "@/util/string";
  import { _ } from "svelte-i18n";

  // Components
  import Progress from "@/common/Progress";
  import Button from "@/common/Button";

  // Store properties
  import { documents } from "@/manager/documents";

  let dismissed = true;

  documents.subscribe(() => {
    if (!documents.doneProcessing && dismissed) {
      dismissed = false;
    }
  });
</script>

<style lang="scss">
  .processingbar {
    background: #eff7ff;
    border-radius: $radius;
    padding: 9px 20px;
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
    }
  }
</style>

{#if !$documents.doneProcessing || !dismissed}
  <div class="processingbar">
    <div class="info">
      {#if $documents.doneProcessing}
        <span class="valign">{$_("processingBar.doneProcessing")}</span>
        <span class="dismiss">
          <Button small={true} on:click={() => (dismissed = true)}>
            {$_("dialog.dismiss")}
          </Button>
        </span>
      {:else}
        {$_("processingBar.processingDocuments", {
          values: { n: $documents.numProcessing },
        })}
      {/if}
    </div>
    <Progress progress={$documents.processingProgress} />
  </div>
{/if}
