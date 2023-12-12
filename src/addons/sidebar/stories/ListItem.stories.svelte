<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import ListItem from "../ListItem.svelte";
  import Pin from "../../../common/icons/Pin.svelte";

  let args = {};

  export const meta = {
    title: "Add-Ons / Sidebar / List Item",
    parameters: { layout: "centered" },
    component: ListItem,
  };
</script>

<Template let:args>
  <div class="sidebar">
    <ListItem {...args}>
      <span slot="icon" class="icon"><Pin /></span>
    </ListItem>
  </div>
</Template>

<Story
  name="Single"
  args={{
    href: "#addon/duckduckgrayduck/Empty-Page-Deletion",
    label: "Empty Page Deleter",
  }}
/>

<style>
  .sidebar {
    width: var(--sidebar-width);
    background-color: var(--sidebar);
  }
  .icon {
    fill: var(--highlight-orange);
  }
</style>
