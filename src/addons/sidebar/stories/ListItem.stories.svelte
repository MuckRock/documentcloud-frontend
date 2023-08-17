<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import ListItem from "../ListItem.svelte";
  import Pin from "../../../common/icons/Pin.svelte";
</script>

<style>
  .sidebar {
    width: var(--sidebar-width);
    background-color: var(--sidebar);
  }
  .icon {
    fill: var(--highlight-orange);
  }
</style>

<Meta
  title="Add-Ons / Sidebar / List Item"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={ListItem}
/>

<Template let:args>
  <div class="sidebar">
    <ListItem {...args}>
      <span slot="icon" class="icon"><Pin /></span>
    </ListItem>
  </div>
</Template>

<Story
  name="ListItem"
  args={{
    href: "#addon/duckduckgrayduck/Empty-Page-Deletion",
    label: "Empty Page Deleter",
  }}
/>
