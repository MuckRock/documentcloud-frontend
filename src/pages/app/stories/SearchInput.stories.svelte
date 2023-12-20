<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import SearchInput from "../SearchInput.svelte";

  import * as mock from "./mock.js";

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
      handlers: [mock.users.data, mock.organizations.data, mock.projects.data],
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
