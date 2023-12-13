<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import Projects from "../Projects.svelte";

  import * as mock from "../../stories/mock.js";

  export const meta = {
    title: "App / Sidebar / Projects",
    component: Projects,
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
  <Projects />
</Story>
