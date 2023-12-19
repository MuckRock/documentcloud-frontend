<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import { action } from "@storybook/addon-actions";
  import ProjectListItem from "../ProjectListItem.svelte";

  export const meta = {
    title: "App / Sidebar / Project List / Item",
    component: ProjectListItem,
    parameters: { layout: "centered" },
  };

  const args = {
    title: "My Project",
    onEditClick: undefined,
  };
</script>

<Template let:args>
  <div class="container">
    <ProjectListItem {...args} />
  </div>
</Template>

<Story name="Default" {args} />
<Story name="Editable" args={{ ...args, onEditClick: action("Edit") }} />
<Story
  name="Long Title"
  args={{
    ...args,
    title:
      "Super Really Long Title That Should Probably Be Truncated So It Doesn't Overflow",
  }}
/>

<style>
  .container {
    max-width: 16rem;
  }
</style>
