<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import ProjectFilters from "../ProjectFilters.svelte";

  import * as mock from "../../stories/mock.js";

  export const meta = {
    title: "App / Sidebar / Project Filters",
    component: ProjectFilters,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story
  name="default"
  parameters={{
    msw: {
      handlers: [
        mock.users.data,
        mock.users.me,
        mock.organizations.data,
        mock.projects.data,
      ],
    },
  }}
>
  <ProjectFilters />
</Story>
