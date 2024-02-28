<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import SidebarSection from "../SidebarSection.svelte";
  import SidebarItem from "../SidebarItem.svelte";
  import Flex from "../common/Flex.svelte";
  import Pin from "@/common/Pin.svelte";

  export const meta = {
    title: "Components / Sidebar / Section",
    component: SidebarSection,
    parameters: { layout: "centered" },
    argTypes: {
      toggle: {
        action: "Toggle",
      },
    },
  };
</script>

<Template>
  <SidebarSection>
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
  </SidebarSection>
</Template>

<Story name="Section" />
