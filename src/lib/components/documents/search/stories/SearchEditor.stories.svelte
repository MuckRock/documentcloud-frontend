<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import SearchEditorComponent from "../../search/SearchEditor.svelte";
  import { projects } from "@/test/handlers/projects";
  import { organizations, users } from "@/test/handlers/accounts";

  export const meta = {
    title: "Components / Documents / Search Editor",
    component: SearchEditorComponent,
    parameters: {
      layout: "centered",
      msw: {
        handlers: [projects.info, users.data, organizations.data],
      },
    },
  };

  const args = {
    query: "example query",
  };
</script>

<Template let:args>
  <SearchEditorComponent {...args} />
</Template>

<Story name="Default" {args} />
