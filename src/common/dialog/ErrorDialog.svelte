<script>
  import Button from "@/common/Button";
  import emitter from "@/emit";
  import { extractErrorData } from "@/manager/errorData";
  import { _ } from "svelte-i18n";

  export let error;
  export let refresh = false;

  $: unexpected = error.errorData == null;

  $: errorData =
    error.errorData != null ? extractErrorData(error.errorData) : null;

  const emit = emitter({
    dismiss() {},
  });
</script>

<style lang="scss">
  .errorcontainer {
    margin: 15px 0;
    border-radius: $radius;
    background: rgba($caution, 0.04);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.12);
    padding: 8px 13px;

    ul {
      margin: 5px 0;
      padding: 0 18px;
    }

    .reason {
      color: $gray;
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
    }

    .error {
      color: $caution;
      font-size: 14px;
    }
  }
</style>

<div>
  <div class="mcontent">
    <h1>
      {#if unexpected}unexpected
        {$_("dialogErrorDialog.unexpectedErrorOccurred")}
      {:else}
        {$_("dialogErrorDialog.errorOccurred")}
      {/if}
    </h1>
    {#if unexpected}
      <p>{$_("dialogErrorDialog.tryAgain")}</p>
    {:else}
      {#each errorData as { key, values }}
        <div class="errorcontainer">
          {#if key != null}
            <div class="reason">{key}:</div>
          {/if}
          <ul>
            {#each values as value}
              <li class="error">{value}</li>
            {/each}
          </ul>
        </div>
      {/each}
    {/if}
    <div class="buttonpadded">
      <Button on:click={emit.dismiss}>
        {#if unexpected}
          {$_("dialogErrorDialog.close")}
        {:else if refresh}
          {$_("dialogErrorDialog.refresh")}
        {:else}
          {$_("dialog.dismiss")}
        {/if}
      </Button>
    </div>
  </div>
</div>
