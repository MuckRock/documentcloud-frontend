<script lang="ts" context="module">
  import { Template, Story } from "@storybook/addon-svelte-csf";
  import SearchEditorComponent from "../../search/SearchEditor.svelte";

  export const meta = {
    title: "Components / Documents / Search Editor",
    component: SearchEditorComponent,
    parameters: {
      layout: "centered",
    },
  };

  const args = {
    initialQuery: "example query",
  };
</script>

<Template let:args>
  <SearchEditorComponent {...args} />
</Template>

<Story name="Empty" args={{ ...args, initialQuery: "" }} />
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
  name="Boolean Operators"
  args={{ ...args, initialQuery: "mueller AND report OR memo" }}
/>
<Story
  name="Field Queries"
  args={{
    ...args,
    initialQuery: "user:102112 access:public sort:-created_at",
  }}
/>
<Story
  name="Date Range"
  args={{
    ...args,
    initialQuery: "created_at:[NOW-1MONTH TO *] report",
  }}
/>
