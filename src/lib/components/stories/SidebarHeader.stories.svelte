<script context="module" lang="ts">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import SidebarHeader from "../SidebarHeader.svelte";
  import Action from "../common/Action.svelte";
  import { Book16, FileDirectory16 } from "svelte-octicons";
  import SidebarItem from "../SidebarItem.svelte";

  export const meta = {
    title: "Components / Sidebar / Header",
    component: SidebarHeader,
    parameters: { layout: "centered" },
    argTypes: {
      toggle: {
        action: "Toggle",
      },
    },
  };

  const args = {
    collapsed: false,
    toggle: action("Toggle"),
  };
</script>

<Template let:args>
  <SidebarHeader {...args}>
    <SidebarItem><FileDirectory16 /> Project</SidebarItem>
    <Action slot="action" icon={Book16}>Explore</Action>
  </SidebarHeader>
</Template>

<Story name="Expanded" {args} />

<Story name="Collapsed" args={{ ...args, collapsed: true }} />
