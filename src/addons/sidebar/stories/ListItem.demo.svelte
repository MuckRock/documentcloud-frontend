<script>
  import ListItem from "../ListItem.svelte";
  import Pin from "../../../common/icons/Pin.svelte";

  export let args = {};
</script>

<style>
  .sidebar {
    width: var(--sidebar-width);
    background-color: var(--sidebar);
  }
  .icon {
    fill: var(--highlight-orange);
  }
</style>

<div class="sidebar">
  <ListItem {...args}>
    <span slot="icon" class="icon"><Pin /></span>
  </ListItem>
</div>
