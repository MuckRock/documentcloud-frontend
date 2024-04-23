<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import SidebarComponent from "../Sidebar.svelte";

  import { me } from "../../../../test/handlers/accounts";
  import { projects } from "../../../../test/handlers/projects";
  import { addons } from "../../../../test/handlers/addons";

  export const meta = {
    title: "App / Sidebar",
    component: SidebarComponent,
    parameters: {
      layout: "fullscreen",
      msw: {
        handlers: [me.data, projects.data, addons.data],
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
  <div class="container"><SidebarComponent {...args} /></div>
</Template>

<Story name="Logged In" {args} />
<Story
  name="Logged Out"
  {args}
  parameters={{ msw: { handlers: [me.error] } }}
/>
