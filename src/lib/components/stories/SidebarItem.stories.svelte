<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import SidebarItem from "../SidebarItem.svelte";
  import { Comment16 } from "svelte-octicons";

  export const meta = {
    title: "Components / Sidebar / Item",
    component: SidebarItem,
    parameters: { layout: "centered" },
  };
</script>

<Story name="Text Only">
  <SidebarItem>Example</SidebarItem>
</Story>

<Story name="Text and Icon">
  <SidebarItem>
    <Comment16 /> Add a note…
  </SidebarItem>
</Story>

<Story name="Hover">
  <SidebarItem hover>
    <Comment16 /> Add a note…
  </SidebarItem>
</Story>

<Story name="Small">
  <SidebarItem small>
    <Comment16 /> Add a note…
  </SidebarItem>
</Story>

<Story name="Disabled">
  <SidebarItem disabled>
    <Comment16 /> Add a note…
  </SidebarItem>
</Story>
