<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";

  import Drawer from "../Drawer.svelte";

  let args = { visible: true, anchor: "right" };

  export const meta = {
    component: Drawer,
    title: "Add-Ons / Drawer",
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  };
</script>

<Template let:args>
  <Drawer {...args}>
    <div slot="content" class="content">
      <h2>Drawer Contents</h2>
      <p>Lorem ipsum dolor sit amet</p>
    </div>
  </Drawer>
</Template>

<Story name="Righthand" {args} />
<Story name="Lefthand" args={{ ...args, anchor: "left" }} />

<style>
  .content {
    padding: 0 1em;
    min-width: 24em;
    margin: 0 auto;
  }
</style>
