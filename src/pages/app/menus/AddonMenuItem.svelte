<script>
  import MenuItem from "../../../common/MenuItem.svelte";
  import { openDispatchAddon } from "../../../manager/layout.js";

  export let addon;

  function handleClick() {
    openDispatchAddon(addon);
  }
</script>

<MenuItem on:click={handleClick}>
  {addon.name}
</MenuItem>
