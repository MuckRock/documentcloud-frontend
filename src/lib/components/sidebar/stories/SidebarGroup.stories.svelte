<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import {
    Book16,
    FileDirectory16,
    ListOrdered16,
    Pencil16,
  } from "svelte-octicons";

  import Action from "$lib/components/common/Action.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import { default as EmptyComponent } from "$lib/components/common/Empty.svelte";
  import Pin from "$lib/components/common/Pin.svelte";

  import SidebarGroup from "../SidebarGroup.svelte";
  import SidebarItem from "../SidebarItem.svelte";

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
    <SidebarItem slot="title"
      ><FileDirectory16 slot="start" /> Project</SidebarItem
    >
    <Action slot="action" icon={Book16}>Explore</Action>
    <Flex direction="column" gap={0}>
      <SidebarItem small href="/project/1">
        <Pin active slot="start" /> Oldest Computer
      </SidebarItem>
      <SidebarItem small href="/project/2">
        <Pin active slot="start" /> FBI Files
      </SidebarItem>
      <SidebarItem small href="/project/3">
        <Pin active slot="start" /> 1033 Project
      </SidebarItem>
    </Flex>
  </SidebarGroup>
</Story>

<Story name="Empty">
  <div style="width: 18rem">
    <SidebarGroup>
      <SidebarItem slot="title"
        ><ListOrdered16 slot="start" /> Sections</SidebarItem
      >
      <Action slot="action" icon={Pencil16}>Edit</Action>
      <EmptyComponent icon={ListOrdered16}>
        Sections organize your document with a table of contents
      </EmptyComponent>
    </SidebarGroup>
  </div>
</Story>

<Story name="Remember collapsed state">
  <p>Refresh to check that <code>collapsed</code> state persists</p>
  <SidebarGroup name="storybook-files">
    <SidebarItem slot="title"
      ><FileDirectory16 slot="start" /> Project</SidebarItem
    >
    <Action slot="action" icon={Book16}>Explore</Action>
    <Flex direction="column" gap={0}>
      <SidebarItem small href="/project/1">
        <Pin active slot="start" /> Oldest Computer
      </SidebarItem>
      <SidebarItem small href="/project/2">
        <Pin active slot="start" /> FBI Files
      </SidebarItem>
      <SidebarItem small href="/project/3">
        <Pin active slot="start" /> 1033 Project
      </SidebarItem>
    </Flex>
  </SidebarGroup>
</Story>
