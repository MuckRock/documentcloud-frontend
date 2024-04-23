<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import ListItemComponent from "../ListItem.svelte";
  import Pin from "../../../../common/icons/Pin.svelte";

  let args = {};

  export const meta = {
    title: "App / Sidebar / List Item",
    parameters: { layout: "centered" },
    component: ListItemComponent,
  };
</script>

<Template let:args>
  <div class="sidebar">
    <ListItemComponent {...args}>
      <span slot="icon" class="icon"><Pin /></span>
    </ListItemComponent>
  </div>
</Template>

<Story
  name="List Item"
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
