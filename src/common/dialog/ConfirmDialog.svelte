<script>
  import Button from "@/common/Button";
  import {
    confirmDialog,
    runConfirm,
    hideConfirm
  } from "@/manager/confirmDialog";
</script>

<div>
  <div class="mcontent">
    <h1>{$confirmDialog.title}</h1>
    <p>{$confirmDialog.body}</p>
    <div class="buttonpadded">
      <Button danger={true} on:click={runConfirm}>
        {$confirmDialog.buttonText}
      </Button>
      <Button secondary={true} on:click={hideConfirm}>Cancel</Button>
    </div>
  </div>
</div>
