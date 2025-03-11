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
    initialQuery: "example query",
  };
</script>

<Template let:args>
  <SearchEditorComponent {...args} />
</Template>

<Story name="Plain Text" {args} />
<Story
  name="Date Query"
  args={{
    ...args,
    initialQuery: 'date:[2020-01-01 TO 2020-05-01] "steve jobs"',
  }}
/>
