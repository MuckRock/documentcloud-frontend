<script context="module">
  import { Story } from "@storybook/addon-svelte-csf";
  import Sidebar from "../Sidebar.svelte";

  import * as mock from "../../stories/mock.js";

  export const meta = {
    title: "App / Sidebar / Sidebar",
    component: Sidebar,
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
  <Sidebar expanded />
</Story>
