<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";

  import Drawer from "../Drawer.svelte";
  import DrawerDemo from "./Drawer.demo.svelte";

  let args = { visible: true, anchor: "right" };
</script>

<Meta
  title="Add-Ons / Drawer"
  tags={["autodocs"]}
  parameters={{ layout: "fullscreen" }}
  component={Drawer}
/>

<Template let:args>
  <DrawerDemo {args} />
</Template>

<Story name="Righthand" {args} />
<Story name="Lefthand" args={{ ...args, anchor: "left" }} />
