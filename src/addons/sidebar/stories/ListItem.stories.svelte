<script>
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import ListItem from "../ListItem.svelte";
  import ListItemDemo from "./ListItem.demo.svelte";
</script>

<Meta
  title="Add-Ons / Sidebar / List Item"
  tags={["autodocs"]}
  parameters={{ layout: "centered" }}
  component={ListItem}
/>

<Template let:args>
  <ListItemDemo {args} />
</Template>

<Story
  name="ListItem"
  args={{
    href: "#addon/duckduckgrayduck/Empty-Page-Deletion",
    label: "Empty Page Deleter",
  }}
/>
