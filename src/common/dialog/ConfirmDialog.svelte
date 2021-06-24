<script>
  import Button from "@/common/Button";
  import {
    confirmDialog,
    runConfirm,
    hideConfirm,
  } from "@/manager/confirmDialog";
  import { _ } from "svelte-i18n";
</script>

<div>
  <div class="mcontent">
    <h1>
      {$_($confirmDialog.title, { values: confirmDialog.translateValues })}
    </h1>
    <p>{$_($confirmDialog.body, { values: confirmDialog.translateValues })}</p>
    <div class="buttonpadded">
      <Button danger={true} on:click={runConfirm}>
        {$_($confirmDialog.buttonText, {
          values: confirmDialog.translateValues,
        })}
      </Button>
      <Button secondary={true} on:click={hideConfirm}
        >{$_("dialog.cancel")}</Button
      >
    </div>
  </div>
</div>
