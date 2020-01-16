<script>
  import Menu from "@/common/Menu";
  import MenuItem from "@/common/MenuItem";

  // Stores
  import {
    removeSelected,
    renameSelected,
    changeAccessSelected,
    reprocessSelected
  } from "@/manager/manager";
</script>

<Menu>
  <MenuItem on:click={renameSelected}>Rename</MenuItem>
  <MenuItem on:click={changeAccessSelected}>Change Access</MenuItem>
  <MenuItem on:click={reprocessSelected}>Force Reprocess</MenuItem>
  <MenuItem danger={true} on:click={removeSelected}>Delete</MenuItem>
</Menu>
