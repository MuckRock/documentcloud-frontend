<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";

  // Stores
  import { layout, selectionProcessing } from "@/manager/layout";
  import {
    removeSelected,
    renameSelected,
    changeAccessSelected,
    editDataSelected,
    reprocessSelected
  } from "@/manager/manager";
  import { onMount } from "svelte";

  let processing = false;
  export let visible = false;

  $: {
    if (visible) {
      processing = selectionProcessing();
    }
  }
</script>

<Menu>
  <MenuItem disabled={$layout.numSelected != 1} on:click={renameSelected}>
    Rename
  </MenuItem>
  <MenuItem disabled={processing} on:click={changeAccessSelected}>
    Change Access
  </MenuItem>
  <MenuItem on:click={editDataSelected}>Edit Document Data</MenuItem>
  <MenuItem disabled={processing} on:click={reprocessSelected}>
    Force Reprocess
  </MenuItem>
  <MenuItem danger={true} on:click={removeSelected}>Delete</MenuItem>
</Menu>
