<script lang="ts" context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import SearchBar from "../SearchBar.svelte";
  import { organizations, users } from "../../../test/handlers/accounts";
  import { projects } from "../../../test/handlers/projects";

  export const meta = {
    title: "App / Search / Search Bar",
    component: SearchBar,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };

  const handlers = [users.data, organizations.data, projects.data];
</script>

<Template let:args>
  <div class="container">
    <SearchBar {...args} />
  </div>
</Template>

<Story
  name="default"
  args={{ search: "project:example-project-123" }}
  parameters={{
    msw: {
      handlers,
    },
  }}
/>

<Story
  name="compact"
  args={{ compact: true, search: "project:example-project-123" }}
  parameters={{
    msw: {
      handlers,
    },
  }}
/>

<Story
  name="example"
  args={{ example: true, search: "project:example-project-123" }}
  parameters={{
    msw: {
      handlers,
    },
  }}
/>

<Story
  name="dialog"
  args={{ dialog: true, search: "user:example-user-123" }}
  parameters={{
    msw: {
      handlers,
    },
  }}
/>

<style>
  .container {
    padding: 2em;
  }
</style>
