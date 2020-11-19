<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";

  // Stores
  import { layout, selectionProcessing } from "@/manager/layout";
  import { metaDialogs } from "@/common/dialog/metaDialogs";
  import { orgsAndUsers } from "@/manager/orgsAndUsers";
  import {
    removeSelected,
    editMetaSelected,
    editDocumentInfoSelected,
    changeAccessSelected,
    editDataSelected,
    reprocessSelected,
    cancelProcessSelected,
    showDiagnosticsSelected,
  } from "@/manager/manager";

  let processing = false;
  let allProcessing = false;
  export let visible = false;

  $: {
    if (visible) {
      [processing, allProcessing] = selectionProcessing();
    }
  }
</script>

<Menu>
  <MenuItem on:click={() => editDocumentInfoSelected()}>
    Edit Document Information
  </MenuItem>
  {#each metaDialogs as meta}
    <MenuItem
      indent={true}
      disabled={meta.disabled == null ? false : meta.disabled($layout.numSelected)}
      on:click={() => editMetaSelected(meta)}>
      {meta.menuTitle}
    </MenuItem>
  {/each}
  <MenuItem disabled={processing} on:click={changeAccessSelected}>
    Change Access
  </MenuItem>
  <MenuItem on:click={editDataSelected}>Edit Document Data</MenuItem>
  {#if allProcessing}
    <MenuItem danger={true} on:click={cancelProcessSelected}>
      Cancel Processing
    </MenuItem>
  {:else if !processing}
    <MenuItem on:click={reprocessSelected}>Force Reprocess</MenuItem>
  {/if}
  <MenuItem danger={true} on:click={removeSelected}>Delete</MenuItem>
  {#if $orgsAndUsers.isStaff}
    <MenuItem special={true} on:click={showDiagnosticsSelected}>
      Diagnostic Info
    </MenuItem>
  {/if}
</Menu>
