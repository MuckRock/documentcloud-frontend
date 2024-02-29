<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import SidebarItem from "../SidebarItem.svelte";
  import { Comment16, Home16 } from "svelte-octicons";

  export const meta = {
    title: "Components / Sidebar / Item",
    component: SidebarItem,
    parameters: { layout: "centered" },
  };

  const click = action("Click");
  const keydown = action("Keydown");
</script>

<Story name="Text Only">
  <SidebarItem on:click={click} on:keydown={keydown}>Example</SidebarItem>
</Story>

<Story name="Text and Icon">
  <SidebarItem on:click={click} on:keydown={keydown}>
    <Comment16 /> Add a note…
  </SidebarItem>
</Story>

<Story name="Link">
  <SidebarItem href="/" on:click={click} on:keydown={keydown}>
    <Home16 /> Go Home
  </SidebarItem>
</Story>

<Story name="Small">
  <SidebarItem small on:click={click} on:keydown={keydown}>
    <Comment16 /> Add a note…
  </SidebarItem>
</Story>

<Story name="Disabled" on:click={click} on:keydown={keydown}>
  <SidebarItem disabled>
    <Comment16 /> Add a note…
  </SidebarItem>
</Story>
