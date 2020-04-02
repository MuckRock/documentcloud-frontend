<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";

  // Stores
  import { layout, selectionNonpending } from "@/manager/layout";
  import {
    removeSelected,
    renameSelected,
    changeAccessSelected,
    editDataSelected,
    reprocessSelected
  } from "@/manager/manager";
  import { onMount } from "svelte";

  let nonPending = false;
  export let visible = false;

  $: {
    if (visible) {
      nonPending = selectionNonpending();
    }
  }
</script>

<Menu>
  <MenuItem disabled={$layout.numSelected != 1} on:click={renameSelected}>
    Rename
  </MenuItem>
  <MenuItem disabled={!nonPending} on:click={changeAccessSelected}>
    Change Access
  </MenuItem>
  <MenuItem on:click={editDataSelected}>Edit Document Data</MenuItem>
  <MenuItem on:click={reprocessSelected}>Force Reprocess</MenuItem>
  <MenuItem danger={true} on:click={removeSelected}>Delete</MenuItem>
</Menu>
