<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import SearchInput from "../SearchInput.svelte";

  import { organizations, users } from "../../../test/handlers/accounts";
  import { projects } from "../../../test/handlers/projects";

  export const meta = {
    title: "App / Search / Search Input",
    component: SearchInput,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
  };
</script>

<Story
  name="default"
  parameters={{
    msw: {
      handlers: [users.data, organizations.data, projects.data],
    },
  }}
>
  <div class="container">
    <SearchInput value="project:example-project-123" />
  </div>
</Story>

<style>
  .container {
    padding: 2em;
  }
</style>
