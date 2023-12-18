<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import ProjectsComponent from "../Projects.svelte";

  import * as mock from "../../stories/mock.js";

  export const meta = {
    title: "App / Sidebar / Projects",
    component: ProjectsComponent,
    parameters: { layout: "fullscreen" },
  };
</script>

<Story
  name="Projects"
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
  <ProjectsComponent />
</Story>
