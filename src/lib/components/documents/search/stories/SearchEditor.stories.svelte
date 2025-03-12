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

<Story name="Single Term" args={{ ...args, initialQuery: "documents" }} />
<Story
  name="Multiple Terms"
  args={{ ...args, initialQuery: "multi term query" }}
/>
<Story
  name="Complex Terms"
  args={{ ...args, initialQuery: 'iPhone "steve jobs" -iPad +mac^3' }}
/>
<Story
  name="Date Query"
  args={{
    ...args,
    initialQuery: 'date:[2020-01-01 TO 2020-05-01] "steve jobs"',
  }}
/>
