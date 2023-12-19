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
        handlers: [mock.me.data, mock.projects.data, mock.addons.data],
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

<Story name="Logged In" {args} />
<Story
  name="Logged Out"
  {args}
  parameters={{ msw: { handlers: [mock.me.error] } }}
/>
