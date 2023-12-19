<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import SidebarComponent from "../Sidebar.svelte";

  import * as mock from "../../stories/mock";

  export const meta = {
    title: "App / Sidebar",
    component: SidebarComponent,
    parameters: {
      layout: "fullscreen",
      msw: {
        handlers: [
          mock.users.data,
          mock.users.me,
          mock.organizations.data,
          mock.projects.data,
        ],
      },
    },
    argTypes: {
      expanded: {
        control: "boolean",
      },
    },
  };

  const args = {
    expanded: true,
  };
</script>

<Template let:args>
  <SidebarComponent {...args} />
</Template>

<Story name="Sidebar" {args} />
