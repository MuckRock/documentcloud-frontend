<script context="module" lang="ts">
  import { Story } from "@storybook/addon-svelte-csf";
  import SidebarGroup from "../SidebarGroup.svelte";
  import SidebarItem from "../SidebarItem.svelte";
  import Flex from "$lib/components/common/Flex.svelte";
  import Pin from "@/common/Pin.svelte";
  import { Book16, FileDirectory16 } from "svelte-octicons";
  import Action from "../../common/Action.svelte";

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

<Story name="Group">
  <SidebarGroup>
    <SidebarItem slot="title"><FileDirectory16 /> Project</SidebarItem>
    <Action slot="action" icon={Book16}>Explore</Action>
    <Flex direction="column" gap={0}>
      <SidebarItem small>
        <Pin active /> Oldest Computer
      </SidebarItem>
      <SidebarItem small>
        <Pin active /> FBI Files
      </SidebarItem>
      <SidebarItem small>
        <Pin active /> 1033 Project
      </SidebarItem>
    </Flex>
  </SidebarGroup>
</Story>
