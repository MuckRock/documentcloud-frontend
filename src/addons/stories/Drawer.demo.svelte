<script>
  import Drawer from "../Drawer.svelte";

  export let args = { visible: true, anchor: "right" };
</script>

<style>
  .content {
    padding: 0 1em;
    min-width: 24em;
    margin: 0 auto;
  }
</style>

<Drawer {...args}>
  <div slot="content" class="content">
    <h2>Drawer Contents</h2>
    <p>Lorem ipsum dolor sit amet</p>
  </div>
</Drawer>
