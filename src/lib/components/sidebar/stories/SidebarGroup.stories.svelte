<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import SidebarGroup from "../SidebarGroup.svelte";
  import SidebarItem from "../SidebarItem.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Pin from "@/common/Pin.svelte";
  import {
    Book16,
    FileDirectory16,
    ListOrdered16,
    Pencil16,
  } from "svelte-octicons";
  import Action from "../../common/Action.svelte";
  import { default as EmptyComponent } from "../../common/Empty.svelte";

  export const meta = {
    title: "Components / Sidebar / Group",
    component: SidebarGroup,
    parameters: { layout: "centered" },
    argTypes: {
      toggle: {
        action: "Toggle",
      },
    },
  };
</script>

<Story name="With Items">
  <SidebarGroup>
    <SidebarItem slot="title"><FileDirectory16 /> Project</SidebarItem>
    <Action slot="action" icon={Book16}>Explore</Action>
    <Flex direction="column" gap={0}>
      <SidebarItem small href="/project/1">
        <Pin active /> Oldest Computer
      </SidebarItem>
      <SidebarItem small href="/project/2">
        <Pin active /> FBI Files
      </SidebarItem>
      <SidebarItem small href="/project/3">
        <Pin active /> 1033 Project
      </SidebarItem>
    </Flex>
  </SidebarGroup>
</Story>

<Story name="Empty">
  <div style="width: 18rem">
    <SidebarGroup>
      <SidebarItem slot="title"><ListOrdered16 /> Sections</SidebarItem>
      <Action slot="action" icon={Pencil16}>Edit</Action>
      <EmptyComponent icon={ListOrdered16}>
        Sections organize your document with a table of contents
      </EmptyComponent>
    </SidebarGroup>
  </div>
</Story>
