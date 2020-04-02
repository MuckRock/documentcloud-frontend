<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";

  // Stores
  import { layout } from "@/manager/layout";
  import {
    removeSelected,
    renameSelected,
    changeAccessSelected,
    editDataSelected,
    reprocessSelected
  } from "@/manager/manager";
</script>

<Menu>
  <MenuItem disabled={$layout.numSelected != 1} on:click={renameSelected}>
    Rename
  </MenuItem>
  <MenuItem
    disabled={!$layout.selectionNonpending}
    on:click={changeAccessSelected}>
    Change Access
  </MenuItem>
  <MenuItem on:click={editDataSelected}>Edit Document Data</MenuItem>
  <MenuItem on:click={reprocessSelected}>Force Reprocess</MenuItem>
  <MenuItem danger={true} on:click={removeSelected}>Delete</MenuItem>
</Menu>
