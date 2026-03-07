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
  name="Grouped Operators"
  args={{
    ...args,
    initialQuery: "(mueller OR watergate) AND NOT report",
  }}
/>
<Story
  name="Prefix Operators"
  args={{
    ...args,
    initialQuery: '+mueller -report +"steve jobs"',
  }}
/>
<Story
  name="Date Range"
  args={{
    ...args,
    initialQuery: "created_at:[NOW-1MONTH TO *] report",
  }}
/>

<!-- Phase 4: Deserialization produces chips automatically from initialQuery -->
<Story
  name="Chips / Field Values"
  args={{
    ...args,
    initialQuery: "user:102112 access:private",
  }}
/>
<Story
  name="Chips / Range"
  args={{
    ...args,
    initialQuery: "created_at:[NOW-1MONTH TO *] report",
  }}
/>
<Story
  name="Chips / Sort"
  args={{
    ...args,
    initialQuery: "mueller sort:page_count",
  }}
/>
<Story
  name="Chips / Mixed Query"
  args={{
    ...args,
    initialQuery:
      "+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count",
  }}
/>
<Story
  name="Chips / Prefixes"
  args={{
    ...args,
    initialQuery: "+user:102112 -access:private",
  }}
/>
