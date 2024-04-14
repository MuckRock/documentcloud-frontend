<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import { Comment16, Home16, Link16, Paintbrush16 } from "svelte-octicons";
  import SidebarItem from "../SidebarItem.svelte";
  import Flex from "../../common/Flex.svelte";

  export const meta = {
    title: "Components / Sidebar / Item",
    component: SidebarItem,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const click = action("Click");
  const keydown = action("Keydown");
</script>

<Story name="Text Only">
  <SidebarItem>Example</SidebarItem>
</Story>

<Story name="Text and Icon">
  <SidebarItem>
    <Comment16 /> Add a note…
  </SidebarItem>
</Story>

<Story name="Link">
  <SidebarItem href="/" on:click={click} on:keydown={keydown}>
    <Home16 /> Go Home
  </SidebarItem>
</Story>

<Story name="Hover">
  <SidebarItem hover>
    <Home16 /> Go Home
  </SidebarItem>
</Story>

<Story name="Active">
  <Flex>
    <SidebarItem active>Static</SidebarItem>
    <SidebarItem active href="#">
      <Link16 /> Link
    </SidebarItem>
    <SidebarItem
      active
      --active-background="var(--orange-light)"
      --active-color="var(--orange-dark)"
      --active-fill="var(--orange)"
    >
      <Paintbrush16 /> Custom Active Colors
    </SidebarItem>
  </Flex>
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
