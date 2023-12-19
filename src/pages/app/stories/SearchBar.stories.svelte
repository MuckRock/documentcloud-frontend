<script context="module">
  import { Story, Template } from "@storybook/addon-svelte-csf";
  import SearchBar from "../SearchBar.svelte";
  import * as mock from "./mock";

  export const meta = {
    title: "App / Search / Search Bar",
    component: SearchBar,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
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
      handlers: [mock.users.data, mock.organizations.data, mock.projects.data],
    },
  }}
/>

<Story
  name="compact"
  args={{ compact: true, search: "project:example-project-123" }}
  parameters={{
    msw: {
      handlers: [mock.users.data, mock.organizations.data, mock.projects.data],
    },
  }}
/>

<Story
  name="example"
  args={{ example: true, search: "project:example-project-123" }}
  parameters={{
    msw: {
      handlers: [mock.users.data, mock.organizations.data, mock.projects.data],
    },
  }}
/>

<Story
  name="dialog"
  args={{ dialog: true, search: "user:example-user-123" }}
  parameters={{
    msw: {
      handlers: [mock.users.data, mock.organizations.data, mock.projects.data],
    },
  }}
/>

<style>
  .container {
    padding: 2em;
  }
</style>
