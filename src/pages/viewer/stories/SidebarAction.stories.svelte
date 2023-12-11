<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";

  import SidebarAction from "../SidebarAction.svelte";

  const args = {
    action: action("Trigger Action"),
    header: "Add Note",
    description:
      "Leave a public, private or shared note, which can be embedded within an article.",
    disabled: false,
  };

  export const meta = {
    title: "Viewer / Sidebar / Action",
    component: SidebarAction,
  };
</script>

<Template let:args>
  <SidebarAction {...args} />
</Template>

<Story name="Action" id="sidebarAction" {args} />
<Story name="Disabled" args={{ ...args, disabled: true }} />
<Story name="Premium" args={{ ...args, premium: true }} />
